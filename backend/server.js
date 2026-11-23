import express from "express";
import mysql2 from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import crypto from "crypto";
import generateBookingQR, { generateLibraryCheckInQR } from "./generateBookingQR.js";
import auth, { getJwtSecret, requireAdmin, requireStudent } from "./auth.js";
import jwt from "jsonwebtoken";

dotenv.config({ path: new URL("./.env", import.meta.url) });
const jwtSecret = getJwtSecret();
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error("Production requires a JWT_SECRET of at least 32 characters.");
}
if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16)) {
    throw new Error("Production requires ADMIN_USERNAME and an ADMIN_PASSWORD of at least 16 characters.");
}
if (!jwtSecret) {
    throw new Error("JWT_SECRET is required.");
}
const app = express();
const config = process.env.DB_URL || process.env.MYSQL_URL;
if (!config) {
    throw new Error("DB_URL is required. Configure it with the Aiven MySQL connection URL.");
}

let dbConfig;
if (config.startsWith("mysql://") || config.startsWith("mysql2://")) {
    const databaseUrl = new URL(config.replace(/^mysql2:/, "mysql:"));
    const usesTls = databaseUrl.searchParams.has("ssl-mode") ||
        databaseUrl.searchParams.has("sslmode") ||
        databaseUrl.hostname.endsWith("aivencloud.com");
    dbConfig = {
        host: databaseUrl.hostname,
        port: Number(databaseUrl.port || 3306),
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, "")),
        ssl: usesTls ? { rejectUnauthorized: false } : undefined
    };
} else {
    dbConfig = config;
}
const mysql = mysql2.createConnection(dbConfig);

const defaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://bookspot-eta.vercel.app"
];
const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: allowedOrigins }));

app.get("/library-checkin-qr", async (_req, res) => {
    try {
        const qrCode = await generateLibraryCheckInQR(process.env.FRONTEND_URL);
        return res.json({
            status: true,
            checkInUrl: `${(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")}/check-in`,
            qrCode
        });
    } catch (err) {
        console.error("Library QR generation failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to generate library check-in QR" });
    }
});

app.get("/health", async (_req, res) => {
    try {
        await mysql.promise().query("SELECT 1");
        return res.json({ status: true, database: "connected" });
    } catch (err) {
        console.error("Health check database query failed:", err.message);
        return res.status(503).json({ status: false, database: "unavailable" });
    }
});

app.post("/register", async (req, res) => {
    const rollNo =req.body.roll_no;
    const name = req.body.name;
    const password =req.body.password;

    if (!rollNo || !name || typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            status: false,
            msg: "Name, roll number, and a password of at least 8 characters are required"
        });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        await mysql.promise().query(
            "INSERT INTO students (roll_no, name, password) VALUES (?, ?, ?)",
            [rollNo, name, hash]
        );
        return res.status(201).json({ status: true, msg: "User registered successfully" });
    }
    catch (err) {
        console.error("Registration failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to create account" });
    }
});

const handleLogin = async (req, res) => {
    const submittedRollNo = req.body?.roll_no || req.query?.roll_no || req.body?.roll || req.query?.roll;
    const rollNo = typeof submittedRollNo === "string" ? submittedRollNo.trim() : "";
    const password = req.body?.password || req.query?.password || req.body?.pwd || req.query?.pwd;

    if (!rollNo || typeof password !== "string" || !password) {
        return res.status(400).json({ status: false, msg: "Roll number and password are required" });
    }

    mysql.query("SELECT roll_no, name, password FROM students WHERE roll_no = ?", [rollNo], async (err, data) => {
        if (err) {
            console.error("Login query failed:", err.message);
            return res.status(500).json({ status: false, msg: "Unable to sign in" });
        }
        if (data.length === 0) {
            return res.status(401).json({ status: false, msg: "User not found" });
        }

        const user = data[0];
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ status: false, msg: "Invalid password" });
        }
        const token = jwt.sign(
            { id: rollNo, role: "student" },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRES_IN || "20m" }
        );
        return res.json({
            status: true,
            msg: "Login successful",
            user: { roll_no: user.roll_no, name: user.name },
            token:token
        });
    });
};

app.post("/login", handleLogin);

app.get("/session", auth, requireStudent, async (req, res) => {
    try {
        const [students] = await mysql.promise().query(
            "SELECT roll_no, name FROM students WHERE roll_no = ?",
            [req.user.id]
        );
        if (students.length === 0) {
            return res.status(401).json({ status: false, msg: "Student account was not found" });
        }
        return res.json({ status: true, user: students[0] });
    } catch (err) {
        console.error("Session validation failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to validate session" });
    }
});

app.post("/admin/login", (req, res) => {
    const { username, password } = req.body || {};
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedUsername || !expectedPassword) {
        return res.status(503).json({ status: false, msg: "Administrator login is not configured" });
    }

    const safeEqual = (provided, expected) => {
        if (typeof provided !== "string") return false;
        const providedBuffer = Buffer.from(provided);
        const expectedBuffer = Buffer.from(expected);
        return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    };

    if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
        return res.status(401).json({ status: false, msg: "Invalid administrator credentials" });
    }

    const token = jwt.sign(
        { id: expectedUsername, role: "admin" },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );
    return res.json({ status: true, msg: "Login successful", user: { username: expectedUsername, role: "admin" }, token });
});

app.post("/bookSeat",auth,requireStudent, async (req, res) => {
    const seatNo = req.body?.seatNo;
    const zone =req.body?.zone;
    const rollNo = req.user?.id;
    const duration = req.body?.duration;
    const requestedStartTime = req.body?.startTime;
    const requestedEndTime = req.body?.endTime;
    const bookingStatus = "CONFIRMED";
    const seatStatus = "booked";

    if (typeof rollNo !== "string" || !rollNo.trim()) {
        return res.status(401).json({ status: false, msg: "Invalid authenticated user" });
    }

    let name;
    try {
        const db = mysql.promise();
        const [students] = await db.query(
            "SELECT name FROM students WHERE roll_no = ?",
            [rollNo]
        );
        if (students.length === 0) {
            return res.status(401).json({ status: false, msg: "Authenticated student was not found" });
        }
        name = students[0].name;

        const [rows] = await db.query(
            "SELECT booking_id FROM bookings WHERE student_id = ? AND status = ?",
            [rollNo, "CONFIRMED"]
        );
        if(rows.length > 0){
            return res.status(400).json({
                status:false,
                msg:"You can't book more than 1 seat"
            })
        }
    } catch (err) {
        console.error("Existing booking check failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to verify existing bookings" });
    }

    if (!seatNo || !zone || !Number.isFinite(duration) || duration <= 0) {
        return res.status(400).json({
            status: false,
            msg: "Seat, zone, student, and a valid duration are required"
        });
    }

    const indiaNow = new Date(Date.now() + 330 * 60 * 1000);
    let startTime = indiaNow;

    if (requestedStartTime) {
        const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i.exec(requestedStartTime);
        if (match) {
            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            if (hours >= 1 && hours <= 12 && minutes <= 59) {
                if (match[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
                if (match[3].toUpperCase() === "AM" && hours === 12) hours = 0;
                startTime = new Date(indiaNow);
                startTime.setUTCHours(hours, minutes, 0, 0);
            }
        }
    }

    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    const toSqlDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");
    const tokenExpiresAt = new Date(indiaNow.getTime() + 24 * 60 * 60 * 1000);
    const db = mysql.promise();

    try {
        const qr = await generateBookingQR(process.env.FRONTEND_URL, tokenExpiresAt);
        await db.beginTransaction();
        const [bookingResult] = await db.query(
            "INSERT INTO bookings (seatNo, student_id, name, start_time, end_time, status, checkin_token_hash, token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [seatNo, rollNo, name, toSqlDate(startTime), toSqlDate(endTime), bookingStatus, qr.tokenHash, toSqlDate(tokenExpiresAt)]
        );

        const [seatResult] = await db.query(
            "UPDATE seats SET isBooked = ? WHERE seatNo = ? AND zone = ? AND isBooked = 'available'",
            [seatStatus, seatNo, zone]
        );

        if (seatResult.affectedRows === 0) {
            await db.rollback();
            return res.status(409).json({
                status: false,
                msg: `Seat ${seatNo} is no longer available in zone ${zone}`
            });
        }

        await db.commit();
        return res.status(201).json({
            status: true,
            msg: "Seat reserved successfully",
            bookingId: bookingResult.insertId,
            booking: {
                bookingId: bookingResult.insertId,
                seatNo,
                zone,
                studentId: rollNo,
                studentName: name,
                startTime: toSqlDate(startTime),
                endTime: toSqlDate(endTime),
                duration,
                status: bookingStatus
            }
        });
    } catch (err) {
        try {
            await db.rollback();
        } catch (rollbackError) {
            console.error("Booking rollback failed:", rollbackError.message);
        }
        console.error("Booking failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to reserve seat" });
    }
});

app.get("/getSeatsData",(req,res)=>{
    mysql.query("SELECT * FROM seats", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log(result);
        res.json(result);
    });
})

app.get("/getStudentsData", auth, requireAdmin, (req,res)=>{
    mysql.query("SELECT roll_no, name FROM students", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
})

app.get("/getBookingsData",auth,requireAdmin,(req,res)=>{
    mysql.query(
        `SELECT booking_id, seatNo, student_id, name, start_time, end_time, status,
                token_expires_at, check_in_time, check_out_time, created_at
         FROM bookings`,
        (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
            res.json(result);
        }
    );
})

app.get("/getBookedSeat",auth,requireStudent,(req,res)=>{
    const rollNo = req.user.id;

try {
    mysql.query(
        `SELECT booking_id, seatNo, student_id, name, start_time, end_time, status,
                token_expires_at, check_in_time, check_out_time, created_at
         FROM bookings WHERE student_id = ? ORDER BY booking_id DESC`,
        [rollNo],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: false,
                    msg: "Database error"
                });
            }

            return res.status(200).json({
                status: true,
                msg: "Successful",
                bookings: result
            });
        }
    );
} catch (err) {
    console.log(err);
    return res.status(500).json({
        status: false,
        msg: "Internal server error"
    });
}
    
})

app.get("/booking-reminders", auth, requireStudent, async (req, res) => {
    const databaseNow = "(UTC_TIMESTAMP() + INTERVAL 330 MINUTE)";
    try {
        const [reminders] = await mysql.promise().query(
            `SELECT booking_id, seatNo,
                    CASE
                        WHEN end_time <= ${databaseNow} THEN 'time-ended'
                        ELSE 'ending-soon'
                    END AS reminder_type
             FROM bookings
             WHERE student_id = ?
               AND status = 'CHECKED_IN'
               AND check_in_time IS NOT NULL
               AND check_out_time IS NULL
               AND end_time <= (${databaseNow} + INTERVAL 10 MINUTE)
             ORDER BY end_time ASC`,
            [req.user.id]
        );
        return res.json({ status: true, reminders });
    } catch (err) {
        console.error("Booking reminder lookup failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to check booking reminders" });
    }
});

app.get("/booking-history", auth, requireStudent, async (req, res) => {
    try {
        const [bookings] = await mysql.promise().query(
            `SELECT booking_id, seatNo, student_id, name,
                    DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
                    DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
                    status,
                    DATE_FORMAT(token_expires_at, '%Y-%m-%d %H:%i:%s') AS token_expires_at,
                    DATE_FORMAT(check_in_time, '%Y-%m-%d %H:%i:%s') AS check_in_time,
                    DATE_FORMAT(check_out_time, '%Y-%m-%d %H:%i:%s') AS check_out_time,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at
             FROM bookings
             WHERE student_id = ?
             ORDER BY created_at DESC, booking_id DESC`,
            [req.user.id]
        );
        return res.json({ status: true, bookings });
    } catch (err) {
        console.error("Booking history lookup failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to load booking history" });
    }
});

app.get("/study-activity", auth, requireStudent, async (req, res) => {
    const year = Number(req.query.year);
    const currentYear = new Date(Date.now() + 330 * 60 * 1000).getUTCFullYear();
    if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
        return res.status(400).json({ status: false, msg: "A valid activity year is required" });
    }

    const startDate = `${year}-01-01 00:00:00`;
    const endDate = `${year + 1}-01-01 00:00:00`;
    try {
        const [rows] = await mysql.promise().execute(
            `SELECT
                 DATE_FORMAT(DATE(check_in_time), '%Y-%m-%d') AS activity_date,
                ROUND(
                SUM(
                    TIMESTAMPDIFF(
                        SECOND,
                        check_in_time,
                        check_out_time
                    )
                ) / 60,
                2
            ) AS total_minutes
             FROM bookings
             WHERE student_id = ?
               AND check_in_time IS NOT NULL
               AND check_out_time IS NOT NULL
               AND check_out_time > check_in_time
               AND check_in_time >= ?
               AND check_in_time < ?
             GROUP BY DATE_FORMAT(DATE(check_in_time), '%Y-%m-%d')
             ORDER BY activity_date`,
            [req.user.id, startDate, endDate]
        );
        console.log([rows]);
        return res.json({ status: true, activity: rows });
    } catch (err) {
        console.error("Study activity lookup failed:", {
            code: err.code,
            message: err.message,
            sqlMessage: err.sqlMessage,
            studentId: req.user.id,
            year
        });
        return res.status(500).json({ status: false, msg: "Unable to load study activity" });
    }
});

app.get("/study-statistics", auth, requireStudent, async (req, res) => {
    const studentId = req.user.id;
    try {
        const [totals] = await mysql.promise().query(
            `SELECT
                 COUNT(*) AS library_visits,
                 COUNT(DISTINCT DATE(check_in_time)) AS active_days,
                 COALESCE(ROUND(SUM(
                     TIMESTAMPDIFF(SECOND, check_in_time, check_out_time)
                 ) / 60, 2), 0) AS total_minutes
             FROM bookings
             WHERE student_id = ?
               AND check_in_time IS NOT NULL
               AND check_out_time IS NOT NULL
               AND check_out_time > check_in_time`,
            [studentId]
        );
        const [activityDates] = await mysql.promise().query(
            `SELECT DATE_FORMAT(DATE(check_in_time), '%Y-%m-%d') AS activity_date
             FROM bookings
             WHERE student_id = ?
               AND check_in_time IS NOT NULL
               AND check_out_time IS NOT NULL
               AND check_out_time > check_in_time
             GROUP BY DATE_FORMAT(DATE(check_in_time), '%Y-%m-%d')
             ORDER BY activity_date DESC`,
            [studentId]
        );
        const totalsRow = totals[0] || {};
        return res.json({
            status: true,
            statistics: {
                total_minutes: Number(totalsRow.total_minutes) || 0,
                active_days: Number(totalsRow.active_days) || 0,
                library_visits: Number(totalsRow.library_visits) || 0,
                activity_dates: activityDates.map((row) => row.activity_date)
            }
        });
    } catch (err) {
        console.error("Study statistics lookup failed:", {
            code: err.code,
            message: err.message,
            sqlMessage: err.sqlMessage,
            studentId
        });
        return res.status(500).json({ status: false, msg: "Unable to load study statistics" });
    }
});

async function cleanupExpiredBookings(db) {
    try {
        await db.beginTransaction();
        const indiaNowSql = "UTC_TIMESTAMP() + INTERVAL 330 MINUTE";
        const [expired] = await db.query(
            `SELECT booking_id, seatNo
             FROM bookings
             WHERE status = 'CONFIRMED'
               AND check_in_time IS NULL
               AND token_expires_at IS NOT NULL
               AND token_expires_at <= (${indiaNowSql})`
        );

        if (expired.length === 0) {
            await db.commit();
            return 0;
        }

        const bookingIds = expired.map((booking) => booking.booking_id);
        await db.query(
            `UPDATE bookings
             SET status = 'CANCELLED',
                 cancelled_at = (${indiaNowSql})
             WHERE booking_id IN (${bookingIds.map(() => "?").join(",")})
               AND status = 'CONFIRMED'
               AND check_in_time IS NULL
               AND token_expires_at <= (${indiaNowSql})`,
            bookingIds
        );

        const seatNumbers = [...new Set(expired.map((booking) => booking.seatNo))];
        for (const seatNo of seatNumbers) {
            const [active] = await db.query(
                `SELECT booking_id
                 FROM bookings
                 WHERE seatNo = ?
                   AND status IN ('CONFIRMED', 'CHECKED_IN')
                   AND check_out_time IS NULL
                 LIMIT 1`,
                [seatNo]
            );
            if (active.length === 0) {
                await db.query("UPDATE seats SET isBooked = 'available' WHERE seatNo = ?", [seatNo]);
            }
        }

        await db.commit();
        return expired.length;
    } catch (err) {
        await db.rollback();
        throw err;
    }
}

app.post("/cleanupExpiredBookings", auth, requireAdmin, async (_req, res) => {
    try {
        const releasedCount = await cleanupExpiredBookings(mysql.promise());
        return res.json({
            status: true,
            releasedCount,
            msg: releasedCount === 0
                ? "No expired bookings to release"
                : `${releasedCount} expired booking(s) cancelled and seats released`
        });
    } catch (err) {
        console.error("Expired booking cleanup failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to release expired bookings" });
    }
});

app.post("/check-in", async (req, res) => {
    const submittedRollNo = typeof req.body?.rollNo === "string" ? req.body.rollNo.trim() : "";
    if (!submittedRollNo) {
        return res.status(400).json({ status: false, msg: "Roll number is required" });
    }
    const rollNo = submittedRollNo;

    try {
        const db = mysql.promise();
        await cleanupExpiredBookings(db);
        const [rows] = await db.query(
            `SELECT booking_id, seatNo, status, start_time, check_in_time,
                    checkin_token_hash, token_expires_at,
                    (token_expires_at <= (UTC_TIMESTAMP() + INTERVAL 330 MINUTE)) AS expired
             FROM bookings
             WHERE student_id = ?
             ORDER BY booking_id DESC`,
            [rollNo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: "No booking found for this roll number" });
        }

        const booking = rows.find((row) =>
            row.status === "CONFIRMED" &&
            !row.check_in_time &&
            typeof row.checkin_token_hash === "string" &&
            /^[a-f0-9]{64}$/i.test(row.checkin_token_hash)
        );
        if (!booking) {
            return res.status(409).json({ status: false, msg: "No valid booking is available for check-in" });
        }
        if (booking.check_in_time) {
            return res.status(409).json({ status: false, msg: "Booking has already been checked in" });
        }
        if (booking.status !== "CONFIRMED") {
            return res.status(409).json({ status: false, msg: "Booking is not available for check-in" });
        }
        if (!booking.token_expires_at || booking.expired) {
            return res.status(410).json({ status: false, msg: "Check-in token has expired" });
        }

        const [result] = await db.query(
            `UPDATE bookings
             SET check_in_time = (UTC_TIMESTAMP() + INTERVAL 330 MINUTE), status = ?
             WHERE booking_id = ? AND status = 'CONFIRMED' AND check_in_time IS NULL
               AND token_expires_at > (UTC_TIMESTAMP() + INTERVAL 330 MINUTE)`,
            ["CHECKED_IN", booking.booking_id]
        );

        if (result.affectedRows === 0) {
            return res.status(409).json({ status: false, msg: "Booking could not be checked in" });
        }

        return res.json({
            status: true,
            msg: "Check-in successful",
            bookingId: booking.booking_id,
            seatNo: booking.seatNo,
            checkInTime: new Date()
        });
    } catch (err) {
        console.error("Check-in failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to complete check-in" });
    }
});

app.post("/check-out", auth, requireStudent, async (req, res) => {
    const token = req.body?.token || req.query?.token;
    const bookingId = req.body?.bookingId || req.query?.bookingId;

    if (!bookingId && (typeof token !== "string" || !token)) {
        return res.status(400).json({ status: false, msg: "Booking ID or check-in token is required" });
    }

    const db = mysql.promise();

    try {
        let rows;

        if (bookingId) {
            [rows] = await db.query(
                "SELECT booking_id, seatNo, student_id, check_in_time, check_out_time FROM bookings WHERE booking_id = ? AND student_id = ?",
                [bookingId, req.user.id]
            );
        } else {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            [rows] = await db.query(
                "SELECT booking_id, seatNo, student_id, check_in_time, check_out_time FROM bookings WHERE checkin_token_hash = ?",
                [tokenHash]
            );
        }

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: "Booking not found" });
        }

        const booking = rows[0];
        if (booking.student_id !== req.user.id) {
            return res.status(403).json({ status: false, msg: "You cannot check out another student's booking" });
        }
        if (booking.check_out_time) {
            return res.status(409).json({ status: false, msg: "Booking has already been checked out" });
        }
        if (!booking.check_in_time) {
            return res.status(409).json({ status: false, msg: "Booking must be checked in before check-out" });
        }

        await db.beginTransaction();
        const [result] = await db.query(
            "UPDATE bookings SET check_out_time = (UTC_TIMESTAMP() + INTERVAL 330 MINUTE), status = ? WHERE booking_id = ? AND check_out_time IS NULL",
            ["COMPLETED", booking.booking_id]
        );

        if (result.affectedRows === 0) {
            await db.rollback();
            return res.status(409).json({ status: false, msg: "Booking could not be checked out" });
        }

        await db.query(
            "UPDATE seats SET isBooked = ? WHERE seatNo = ?",
            ["available", booking.seatNo]
        );
        await db.commit();

        return res.json({
            status: true,
            msg: "Check-out successful",
            bookingId: booking.booking_id,
            seatNo: booking.seatNo,
            checkOutTime: new Date()
        });
    } catch (err) {
        try {
            await db.rollback();
        } catch (rollbackError) {
            console.error("Check-out rollback failed:", rollbackError.message);
        }
        console.error("Check-out failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to complete check-out" });
    }
});

app.post("/cancelBooking", auth, requireStudent, async (req, res) => {
    const bookingId = req.body?.bookingId;
    const rollNo = req.user.id;

    if (!bookingId || !rollNo) {
        return res.status(400).json({ status: false, msg: "Booking ID and student ID are required" });
    }

    const db = mysql.promise();

    try {
        await db.beginTransaction();
        const [rows] = await db.query(
            "SELECT booking_id, seatNo, check_in_time FROM bookings WHERE booking_id = ? AND student_id = ?",
            [bookingId, rollNo]
        );

        if (rows.length === 0) {
            await db.rollback();
            return res.status(404).json({ status: false, msg: "Booking not found" });
        }

        const booking = rows[0];
        if (booking.check_in_time) {
            await db.rollback();
            return res.status(409).json({ status: false, msg: "A checked-in booking must be checked out instead" });
        }

        const [result] = await db.query(
            "UPDATE bookings SET status = ?, check_out_time = (UTC_TIMESTAMP() + INTERVAL 330 MINUTE) WHERE booking_id = ? AND student_id = ?",
            ["CANCELLED", bookingId, rollNo]
        );

        if (result.affectedRows === 0) {
            await db.rollback();
            return res.status(409).json({ status: false, msg: "Booking could not be cancelled" });
        }

        await db.query("UPDATE seats SET isBooked = ? WHERE seatNo = ?", ["available", booking.seatNo]);
        await db.commit();

        return res.json({ status: true, msg: "Booking cancelled successfully", bookingId, seatNo: booking.seatNo });
    } catch (err) {
        try {
            await db.rollback();
        } catch (rollbackError) {
            console.error("Cancellation rollback failed:", rollbackError.message);
        }
        console.error("Booking cancellation failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to cancel booking" });
    }
});

const port = process.env.PORT || 2007;
const server = app.listen(port, async () => {
    try {
        await mysql.promise().query("SELECT 1");
        await cleanupExpiredBookings(mysql.promise());
        console.log(`Server listening on port ${port}; database connected`);
    } catch (err) {
        console.error("Initial database connection failed:", err.message);
    }
});

const expiryCleanupTimer = setInterval(async () => {
    try {
        await cleanupExpiredBookings(mysql.promise());
    } catch (err) {
        console.error("Scheduled expired booking cleanup failed:", err.message);
    }
}, 60 * 1000);
expiryCleanupTimer.unref();

process.on("SIGTERM", () => {
    server.close(() => mysql.end(() => process.exit(0)));
});

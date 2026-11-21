import express from "express";
import mysql2 from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import crypto from "crypto";
import generateBookingQR, { generateLibraryCheckInQR } from "./generateBookingQR.js";

dotenv.config({ path: new URL("./.env", import.meta.url) });
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

        return res.json({
            status: true,
            msg: "Login successful",
            user: { roll_no: user.roll_no, name: user.name }
        });
    });
};

app.get("/login", handleLogin);
app.post("/login", handleLogin);

app.post("/bookSeat", async (req, res) => {
    const seatNo = req.body?.seatNo;
    const zone =req.body?.zone;
    const rollNo = req.body?.roll;
    const name =req.body?.name;
    const duration = req.body?.duration;
    const requestedStartTime = req.body?.startTime;
    const requestedEndTime = req.body?.endTime;
    const bookingStatus = "CONFIRMED";
    const seatStatus = "booked";

    try {
        const db = mysql.promise();
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

    if (!seatNo || !zone || !rollNo || !name || !Number.isFinite(duration) || duration <= 0) {
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

app.get("/getStudentsData",(req,res)=>{
    mysql.query("SELECT * FROM students", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log(result);
        res.json(result);
    });
})

app.get("/getBookingsData",(req,res)=>{
    mysql.query("SELECT * FROM bookings", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log(result);
        res.json(result);
    });
})

app.get("/getBookedSeat",(req,res)=>{
    let {roll_no} = req.query;

try {
    mysql.query(
        "SELECT * FROM bookings WHERE student_id = ? ORDER BY booking_id DESC",
        [roll_no],
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

app.post("/cleanupExpiredBookings", async (_req, res) => {
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
    const rollNo = String(req.body?.rollNo || req.body?.roll_no || req.query?.rollNo || req.query?.roll_no || "").trim();
    if (!rollNo) {
        return res.status(400).json({ status: false, msg: "Roll number is required" });
    }

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

app.post("/check-out", async (req, res) => {
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
                "SELECT booking_id, seatNo, check_in_time, check_out_time FROM bookings WHERE booking_id = ?",
                [bookingId]
            );
        } else {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            [rows] = await db.query(
                "SELECT booking_id, seatNo, check_in_time, check_out_time FROM bookings WHERE checkin_token_hash = ?",
                [tokenHash]
            );
        }

        if (rows.length === 0) {
            return res.status(404).json({ status: false, msg: "Booking not found" });
        }

        const booking = rows[0];
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

app.post("/cancelBooking", async (req, res) => {
    const bookingId = req.body?.bookingId;
    const rollNo = req.body?.rollNo;

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

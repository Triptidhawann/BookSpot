import crypto from "crypto";
import generateBookingQR, { generateLibraryCheckInQR } from "../generateBookingQR.js";
import mysql from "../models/database.js";
import { cleanupExpiredBookings } from "../models/bookingModel.js";
export const get_library_checkin_qr = async (_req, res) => {
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
};

export const post_bookseat = async (req, res) => {
    const seatNo = req.body?.seatNo;
    const zone =req.body?.zone;
    const rollNo = req.user?.id;
    const duration = req.body?.duration;
    const requestedStartTime = req.body?.startTime;
    const bookingStatus = "CONFIRMED";
    const seatStatus = "booked";

    if (typeof rollNo !== "string" || !rollNo.trim()) {
        return res.status(401).json({ status: false, msg: "Invalid authenticated user" });
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
    let db;

    try {
        db = await mysql.promise().getConnection();
        const qr = await generateBookingQR(process.env.FRONTEND_URL, tokenExpiresAt);
        // Clear no-shows first, then serialize this student's booking attempts.
        await cleanupExpiredBookings(db);
        await db.beginTransaction();
        const [students] = await db.query(
            "SELECT name FROM students WHERE roll_no = ? FOR UPDATE",
            [rollNo]
        );
        if (students.length === 0) {
            await db.rollback();
            return res.status(401).json({ status: false, msg: "Authenticated student was not found" });
        }
        const name = students[0].name;

        const [activeBookings] = await db.query(
            `SELECT booking_id FROM bookings
             WHERE student_id = ?
               AND status IN ('CONFIRMED', 'CHECKED_IN')
               AND check_out_time IS NULL
             LIMIT 1`,
            [rollNo]
        );
        if (activeBookings.length > 0) {
            await db.rollback();
            return res.status(400).json({
                status: false,
                msg: "You can't book more than 1 seat"
            });
        }

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
    } finally {
        if (db) db.release();
    }
};

export const get_getbookedseat = (req,res) => {
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
    
};

export const get_booking_reminders = async (req, res) => {
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
};

export const get_booking_history = async (req, res) => {
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
};

export const post_extend_booking = async (req, res) => {
    const bookingId = req.body?.bookingId;
    if (!/^\d+$/.test(String(bookingId || ""))) {
        return res.status(400).json({ status: false, msg: "A valid booking ID is required" });
    }

    try {
        const db = mysql.promise();
        const [result] = await db.execute(
            `UPDATE bookings
             SET end_time = DATE_ADD(end_time, INTERVAL 1 HOUR)
             WHERE booking_id = ?
               AND student_id = ?
               AND check_out_time IS NULL`,
            [bookingId, req.user.id]
        );
        if (result.affectedRows !== 1) {
            return res.status(409).json({ status: false, msg: "This booking can no longer be extended" });
        }

        const [rows] = await db.execute(
            `SELECT DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
                    ROUND(TIMESTAMPDIFF(SECOND, start_time, end_time) / 3600, 2) AS duration_hours
             FROM bookings
             WHERE booking_id = ? AND student_id = ?`,
            [bookingId, req.user.id]
        );
        return res.json({ status: true, msg: "Booking extended by one hour", booking: rows[0] });
    } catch (err) {
        console.error("Booking extension failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to extend this booking" });
    }
};

export const post_check_in = async (req, res) => {
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
};

export const post_check_out = async (req, res) => {
    const token = req.body?.token || req.query?.token;
    const bookingId = req.body?.bookingId || req.query?.bookingId;

    if (!bookingId && (typeof token !== "string" || !token)) {
        return res.status(400).json({ status: false, msg: "Booking ID or check-in token is required" });
    }

    let db;

    try {
        db = await mysql.promise().getConnection();
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
    } finally {
        if (db) db.release();
    }
};

export const post_cancelbooking = async (req, res) => {
    const bookingId = req.body?.bookingId;
    const rollNo = req.user.id;

    if (!bookingId || !rollNo) {
        return res.status(400).json({ status: false, msg: "Booking ID and student ID are required" });
    }

    let db;

    try {
        db = await mysql.promise().getConnection();
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
    } finally {
        if (db) db.release();
    }
};

import crypto from "crypto";
import jwt from "jsonwebtoken";
import mysql from "../models/database.js";
import { getJwtSecret } from "../auth.js";
import { cleanupExpiredBookings } from "../models/bookingModel.js";

const jwtSecret = getJwtSecret();
export const post_admin_login = (req, res) => {
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
};

export const get_getstudentsdata = async (_req, res) => {
    try {
        return res.json(await listStudents());
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const get_getbookingsdata = (req,res) => {
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
};

export const post_cleanupexpiredbookings = async (_req, res) => {
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
};

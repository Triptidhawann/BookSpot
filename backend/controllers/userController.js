import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "../models/database.js";
import { getJwtSecret } from "../auth.js";
import { createStudent, findStudent, findStudentCredentials } from "../models/studentModel.js";
import { listSeats } from "../models/seatModel.js";

const jwtSecret = getJwtSecret();
export const get_health = async (_req, res) => {
    try {
        await mysql.promise().query("SELECT 1");
        return res.json({ status: true, database: "connected" });
    } catch (err) {
        console.error("Health check database query failed:", err.message);
        return res.status(503).json({ status: false, database: "unavailable" });
    }
};

export const post_register = async (req, res) => {
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
        await createStudent(rollNo, name, hash);
        return res.status(201).json({ status: true, msg: "User registered successfully" });
    }
    catch (err) {
        console.error("Registration failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to create account" });
    }
};

export const get_session = async (req, res) => {
    try {
        const student = await findStudent(req.user.id);
        if (!student) {
            return res.status(401).json({ status: false, msg: "Student account was not found" });
        }
        return res.json({ status: true, user: student });
    } catch (err) {
        console.error("Session validation failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to validate session" });
    }
};

export const get_getseatsdata = async (_req, res) => {
    try {
        return res.json(await listSeats());
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const get_study_activity = async (req, res) => {
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
};

export const get_study_statistics = async (req, res) => {
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
};

export const handleLogin = async (req, res) => {
    const submittedRollNo = req.body?.roll_no || req.query?.roll_no || req.body?.roll || req.query?.roll;
    const rollNo = typeof submittedRollNo === "string" ? submittedRollNo.trim() : "";
    const password = req.body?.password || req.query?.password || req.body?.pwd || req.query?.pwd;

    if (!rollNo || typeof password !== "string" || !password) {
        return res.status(400).json({ status: false, msg: "Roll number and password are required" });
    }

    try {
        const user = await findStudentCredentials(rollNo);
        if (!user) {
            return res.status(401).json({ status: false, msg: "User not found" });
        }

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
    } catch (err) {
        console.error("Login query failed:", err.message);
        return res.status(500).json({ status: false, msg: "Unable to sign in" });
    }
};

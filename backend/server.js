import express from "express";
import mysql2 from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";

dotenv.config({ path: new URL("./.env", import.meta.url) });
const app = express();
const config = process.env.DB_URL;
const mysql = mysql2.createConnection(config);

app.use(express.json());
app.use(cors());

mysql.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to database successfully");
});

app.post("/register", async (req, res) => {
    const rollNo =req.body.roll_no;
    const name = req.body.name;
    const password =req.body.password;

    if (!rollNo || !name || password.length < 8) {
        return res.status(400).json({
            status: false,
            msg: "Name, roll number, and a password of at least 8 characters are required"
        });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        mysql.query(
            "INSERT INTO students (roll_no, name, password) VALUES (?, ?, ?)",
            [rollNo, name, hash]),
           
                res.status(201).json({ status: true, msg: "User registered successfully" })
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
    const seatNo = req.body?.seatId;
    const zone =req.body?.zone;
    const rollNo = req.body?.roll;
    const name =req.body?.name;
    const duration = req.body?.duration;
    const bookingStatus = "CONFIRMED";
    const seatStatus = "occupied";

    if (!seatNo || !zone || !rollNo || !name || !Number.isFinite(duration) || duration <= 0) {
        return res.status(400).json({
            status: false,
            msg: "Seat, zone, student, and a valid duration are required"
        });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    const db = mysql.promise();

    try {
        await db.beginTransaction();
        await db.query(
            "INSERT INTO bookings (seatNo, student_id, name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)",
            [seatNo, rollNo, name, startTime, endTime, bookingStatus]
        );

        const [seatResult] = await db.query(
            "UPDATE seats SET isBooked = ? WHERE seatNo = ? AND zone = ?",
            [seatStatus, seatNo, zone]
        );

        if (seatResult.affectedRows === 0) {
            await db.rollback();
            return res.status(404).json({
                status: false,
                msg: `Seat ${seatNo} was not found in zone ${zone}`
            });
        }

        await db.commit();
        return res.status(201).json({ status: true, msg: "Seat reserved successfully" });
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

app.listen(2007,()=>{
    console.log("Server listening on port 2007")
})

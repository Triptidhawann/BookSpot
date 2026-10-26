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
    const rollNo = typeof req.body?.roll_no === "string" ? req.body.roll_no.trim() : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

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
            [rollNo, name, hash],
            (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({ status: false, msg: "That roll number is already registered" });
                    }
                    console.error("Registration query failed:", err.message);
                    return res.status(500).json({ status: false, msg: "Unable to create account" });
                }
                return res.status(201).json({ status: true, msg: "User registered successfully" });
            }
        );
    } catch (err) {
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

app.post("/bookSeat",(req,res)=>{

    let seatId = req.body.seatId;
    let roll_no = req.body.roll;
    let name = req.body.name;
    let start = req.body.start;
    let end = req.body.end;
    let status = req.body.status;
    mysql.query("insert into bookings values(?,?,?,?,?,?,NOW(),NULL)",[seatId,roll_no,name,start,end,status],function(err){
        if(err == null)
            res.json({status:true,msg:"Seat reserved successfully"})
        else 
            res.json({status:false,err})
    });

});

app.listen(2007,()=>{
    console.log("Server listening on port 2007")
})



import mysql from "./database.js";

export async function createStudent(rollNo, name, passwordHash) {
    return mysql.promise().query(
        "INSERT INTO students (roll_no, name, password) VALUES (?, ?, ?)",
        [rollNo, name, passwordHash]
    );
}

export async function findStudentCredentials(rollNo) {
    const [rows] = await mysql.promise().query(
        "SELECT roll_no, name, password FROM students WHERE roll_no = ?",
        [rollNo]
    );
    return rows[0] || null;
}

export async function findStudent(rollNo) {
    const [rows] = await mysql.promise().query(
        "SELECT roll_no, name FROM students WHERE roll_no = ?",
        [rollNo]
    );
    return rows[0] || null;
}

export async function listStudents() {
    const [rows] = await mysql.promise().query("SELECT roll_no, name FROM students");
    return rows;
}

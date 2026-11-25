import mysql from "./database.js";

export async function listSeats() {
    const [rows] = await mysql.promise().query("SELECT * FROM seats");
    return rows;
}

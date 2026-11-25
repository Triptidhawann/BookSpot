import express from "express";
import cors from "cors";
import { getJwtSecret } from "./auth.js";
import mysql from "./models/database.js";
import { cleanupExpiredBookings } from "./models/bookingModel.js";
import apiRoutes from "./routes/apiRoutes.js";

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
app.use(apiRoutes);

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

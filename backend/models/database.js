import mysql2 from "mysql2";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url) });

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

const poolOptions = typeof dbConfig === "object"
    ? {
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0
    }
    : dbConfig;
const mysql = mysql2.createPool(poolOptions);

export default mysql;

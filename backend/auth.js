import jwt from "jsonwebtoken";

export function getJwtSecret() {
    return process.env.JWT_SECRET || process.env.jwt_secret;
}

function auth(req, res, next) {
    const secret = getJwtSecret();
    if (!secret) {
        return res.status(500).json({ status: false, msg: "Authentication is not configured" });
    }

    const match = /^Bearer\s+(\S+)$/i.exec(req.get("authorization") || "");
    if (!match) {
        return res.status(401).json({ status: false, msg: "Bearer token required" });
    }

    try {
        const decoded = jwt.verify(match[1], secret);
        if (!decoded || typeof decoded !== "object" || (!decoded.id && !decoded.role)) {
            return res.status(401).json({ status: false, msg: "Invalid token" });
        }

        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ status: false, msg: "Invalid or expired token" });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ status: false, msg: "Administrator access required" });
    }
    return next();
}

export function requireStudent(req, res, next) {
    if (req.user?.role !== "student" || typeof req.user?.id !== "string") {
        return res.status(403).json({ status: false, msg: "Student access required" });
    }
    return next();
}

export default auth;

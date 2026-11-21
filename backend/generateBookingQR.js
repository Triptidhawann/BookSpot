import crypto from "crypto";
import QRCode from "qrcode";

export default async function generateBookingQR(frontendUrl, tokenExpiresAt) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const baseUrl = (frontendUrl || "http://localhost:5173").replace(/\/$/, "");
    const checkInUrl = `${baseUrl}/check-in`;
    const qrCode = await QRCode.toDataURL(checkInUrl);

    return {
        token,
        tokenHash,
        qrCode,
        tokenExpiresAt
    };
}

export async function generateLibraryCheckInQR(frontendUrl) {
    const baseUrl = (frontendUrl || "http://localhost:5173").replace(/\/$/, "");
    return QRCode.toDataURL(`${baseUrl}/check-in`);
}

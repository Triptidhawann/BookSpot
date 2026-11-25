/** Release reservations that were not checked in within 15 minutes of start. */
export async function cleanupExpiredBookings(db) {
    const ownsConnection = typeof db.getConnection === "function";
    const connection = ownsConnection ? await db.getConnection() : db;
    try {
        await connection.beginTransaction();
        const indiaNowSql = "UTC_TIMESTAMP() + INTERVAL 330 MINUTE";
        const noShowDeadlineSql = "DATE_ADD(start_time, INTERVAL 15 MINUTE)";
        const [expired] = await connection.query(
            `SELECT booking_id, seatNo
             FROM bookings
             WHERE status = 'CONFIRMED'
               AND check_in_time IS NULL
               AND ${noShowDeadlineSql} <= (${indiaNowSql})`
        );

        if (expired.length === 0) {
            await connection.commit();
            return 0;
        }

        const bookingIds = expired.map((booking) => booking.booking_id);
        await connection.query(
            `UPDATE bookings
             SET status = 'CANCELLED', cancelled_at = (${indiaNowSql})
             WHERE booking_id IN (${bookingIds.map(() => "?").join(",")})
               AND status = 'CONFIRMED'
               AND check_in_time IS NULL
               AND ${noShowDeadlineSql} <= (${indiaNowSql})`,
            bookingIds
        );

        const seatNumbers = [...new Set(expired.map((booking) => booking.seatNo))];
        for (const seatNo of seatNumbers) {
            const [active] = await connection.query(
                `SELECT booking_id FROM bookings
                 WHERE seatNo = ? AND status IN ('CONFIRMED', 'CHECKED_IN')
                   AND check_out_time IS NULL LIMIT 1`,
                [seatNo]
            );
            if (active.length === 0) {
                await connection.query("UPDATE seats SET isBooked = 'available' WHERE seatNo = ?", [seatNo]);
            }
        }

        await connection.commit();
        return expired.length;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        if (ownsConnection) connection.release();
    }
}

import { Router } from "express";
import auth, { requireAdmin, requireStudent } from "../auth.js";
import * as admin from "../controllers/adminController.js";
import * as user from "../controllers/userController.js";
import * as bookings from "../controllers/bookingController.js";

const router = Router();

router.get("/library-checkin-qr", bookings.get_library_checkin_qr);
router.get("/health", user.get_health);
router.post("/register", user.post_register);
router.post("/login", user.handleLogin);
router.get("/session", auth, requireStudent, user.get_session);
router.post("/admin/login", admin.post_admin_login);
router.post("/bookSeat", auth, requireStudent, bookings.post_bookseat);
router.get("/getSeatsData", user.get_getseatsdata);
router.get("/getStudentsData", auth, requireAdmin, admin.get_getstudentsdata);
router.get("/getBookingsData", auth, requireAdmin, admin.get_getbookingsdata);
router.get("/getBookedSeat", auth, requireStudent, bookings.get_getbookedseat);
router.get("/booking-reminders", auth, requireStudent, bookings.get_booking_reminders);
router.get("/booking-history", auth, requireStudent, bookings.get_booking_history);
router.post("/extend-booking", auth, requireStudent, bookings.post_extend_booking);
router.get("/study-activity", auth, requireStudent, user.get_study_activity);
router.get("/study-statistics", auth, requireStudent, user.get_study_statistics);
router.post("/cleanupExpiredBookings", auth, requireAdmin, admin.post_cleanupexpiredbookings);
router.post("/check-in", bookings.post_check_in);
router.post("/check-out", auth, requireStudent, bookings.post_check_out);
router.post("/cancelBooking", auth, requireStudent, bookings.post_cancelbooking);

export default router;

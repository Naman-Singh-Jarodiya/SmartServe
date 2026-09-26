const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  assignTechnician,
  getTechnicianBookings,
  updateBookingStatus,
  sendTechnicianRequest,
  generateCompletionOtp,
  verifyCompletionOtp,
  getCompletionOtp,
  createPaymentOrder,
  verifyPayment,
  selectCashPayment,
  confirmCashPayment,
  submitProblemDescription,
  sendTechnicianQuote,
  acceptTechnicianQuote,
  rejectTechnicianQuote,
} = require("../controllers/bookingController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createBooking
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getMyBookings
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllBookings
);

router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("ADMIN"),
  assignTechnician
);

router.post(
  "/:id/request-technician",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  sendTechnicianRequest
);

router.get(
  "/technician",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  getTechnicianBookings
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  updateBookingStatus
);

router.post(
  "/:id/completion-otp",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  generateCompletionOtp
);

router.post(
  "/:id/verify-completion",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  verifyCompletionOtp
);

router.get(
  "/:id/completion-otp",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  getCompletionOtp
);

router.post(
  "/:id/payment/order",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  createPaymentOrder
);

router.post(
  "/:id/payment/verify",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  verifyPayment
);

router.post(
  "/:id/payment/cash",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  selectCashPayment
);

router.post(
  "/:id/payment/cash/confirm",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  confirmCashPayment
);

router.post(
  "/:id/problem",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  submitProblemDescription
);

router.post(
  "/:id/quote",
  authMiddleware,
  roleMiddleware("TECHNICIAN"),
  sendTechnicianQuote
);

router.post(
  "/:id/quote/accept",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  acceptTechnicianQuote
);

router.post(
  "/:id/quote/reject",
  authMiddleware,
  roleMiddleware("CUSTOMER"),
  rejectTechnicianQuote
);

module.exports = router;
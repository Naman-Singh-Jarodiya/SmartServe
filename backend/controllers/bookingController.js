const axios = require("axios");
const pool = require("../config/db");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const createBooking = async (req, res) => {
  try {
    const { service_id, booking_date } = req.body;

    if (!service_id || !booking_date) {
      return res.status(400).json({
        message: "Service and booking date are required",
      });
    }

    const service = await pool.query(
      "SELECT id, price FROM services WHERE id = $1",
      [service_id],
    );

    if (service.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const selectedAddress = await pool.query(
      `SELECT
          id,
          label,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude
       FROM addresses
       WHERE user_id = $1
       AND is_selected = TRUE
       LIMIT 1`,
      [req.user.id],
    );

    if (selectedAddress.rows.length === 0) {
      return res.status(400).json({
        message: "Please select an address before booking",
      });
    }

    const location = selectedAddress.rows[0];

    const fullAddress = `${location.address}, ${location.city}, ${location.state} - ${location.pincode}`;

    const result = await pool.query(
      `INSERT INTO bookings
        (
          user_id,
          service_id,
          booking_date,
          amount,
          address,
          latitude,
          longitude
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        service_id,
        booking_date,
        service.rows[0].price,
        fullAddress,
        location.latitude,
        location.longitude,
      ],
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: result.rows[0],
      address: location,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          b.id,
          s.name AS service,
          b.booking_date,
          b.status,
          b.amount,
          b.created_at,
          b.payment_status,
          b.payment_method,
          b.paid_at,
          b.transaction_id,
          t.id AS technician_id,
          tu.name AS technician,
          ts.experience_years,
          b.problem_description,
          b.quoted_amount,
          b.quote_status,
          (
    SELECT u2.name
    FROM booking_requests br2
    JOIN technicians t2
      ON t2.id = br2.technician_id
    JOIN users u2
      ON u2.id = t2.user_id
    WHERE br2.booking_id = b.id
      AND br2.status = 'PENDING'
    ORDER BY br2.created_at DESC
    LIMIT 1
) AS pending_technician,

(
    SELECT ts2.experience_years
    FROM booking_requests br3
    JOIN technician_services ts2
      ON ts2.technician_id = br3.technician_id
     AND ts2.service_id = b.service_id
    WHERE br3.booking_id = b.id
      AND br3.status = 'PENDING'
    ORDER BY br3.created_at DESC
    LIMIT 1
) AS pending_technician_experience,

          r.rating AS review_rating,
          r.comment AS review_comment
       FROM bookings b
       JOIN services s
         ON b.service_id = s.id
       LEFT JOIN technicians t
         ON b.technician_id = t.id
       LEFT JOIN users tu
         ON t.user_id = tu.id
       LEFT JOIN technician_services ts
         ON ts.technician_id = t.id
        AND ts.service_id = b.service_id
       LEFT JOIN reviews r
         ON r.booking_id = b.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          b.id,
          b.service_id,
          u.name AS customer,
          s.name AS service,
          t.id AS technician_id,
          tu.name AS technician,
          b.booking_date,
          b.status,
          b.amount,
          b.payment_status,
          b.payment_method,
          b.paid_at
       FROM bookings b
       JOIN users u
         ON b.user_id = u.id
       JOIN services s
         ON b.service_id = s.id
       LEFT JOIN technicians t
         ON b.technician_id = t.id
       LEFT JOIN users tu
         ON t.user_id = tu.id
       ORDER BY b.created_at DESC`,
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const sendTechnicianRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id, problem_description } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        message: "Technician ID is required",
      });
    }

    if (!problem_description || !problem_description.trim()) {
      return res.status(400).json({
        message: "Problem description is required",
      });
    }

    const booking = await pool.query(
      `SELECT
          service_id,
          user_id,
          status
       FROM bookings
       WHERE id = $1`,
      [id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const data = booking.rows[0];

    if (data.user_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only manage your own booking",
      });
    }

    if (data.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking is not available for technician selection",
      });
    }

    const qualified = await pool.query(
      `SELECT id
       FROM technician_services
       WHERE technician_id = $1
       AND service_id = $2`,
      [technician_id, data.service_id],
    );

    if (qualified.rows.length === 0) {
      return res.status(400).json({
        message: "Technician is not qualified for this service",
      });
    }

    const result = await pool.query(
      `INSERT INTO booking_requests
          (
            booking_id,
            technician_id,
            status
          )
       VALUES ($1, $2, 'PENDING')
       RETURNING *`,
      [id, technician_id],
    );

    await pool.query(
      `UPDATE bookings
       SET problem_description = $1,
           quote_status = 'WAITING_TECHNICIAN'
       WHERE id = $2`,
      [problem_description.trim(), id],
    );

    res.status(201).json({
      message:
        "Request sent successfully. Waiting for technician acceptance and quote.",
      request: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Request already sent to this technician",
      });
    }

    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        message: "Technician ID is required",
      });
    }

    const booking = await pool.query(
      `SELECT service_id, status
       FROM bookings
       WHERE id = $1`,
      [id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const technician = await pool.query(
      `SELECT id
       FROM technicians
       WHERE id = $1`,
      [technician_id],
    );

    if (technician.rows.length === 0) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    const qualified = await pool.query(
      `SELECT id
       FROM technician_services
       WHERE technician_id = $1
       AND service_id = $2`,
      [technician_id, booking.rows[0].service_id],
    );

    if (qualified.rows.length === 0) {
      return res.status(400).json({
        message: "Technician is not qualified for this service",
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET technician_id = $1,
           status = 'ACCEPTED'
       WHERE id = $2
       RETURNING *`,
      [technician_id, id],
    );

    res.json({
      message: "Technician assigned successfully",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getTechnicianBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          b.id,
          u.name AS customer,
          s.name AS service,
          b.booking_date,
          b.status,
          b.amount,
          b.problem_description,
          b.quoted_amount,
          b.quote_status,
          b.payment_status,
          b.payment_method,
          b.paid_at
       FROM bookings b
       JOIN users u
         ON b.user_id = u.id
       JOIN services s
         ON b.service_id = s.id
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE t.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load technician bookings",
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Technician can only start the service",
      });
    }

    const booking = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.quote_status,
          b.payment_status
       FROM bookings b
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE b.id = $1
       AND t.user_id = $2`,
      [id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message:
          "Booking not found or not assigned to you",
      });
    }

    const data = booking.rows[0];

    if (data.status !== "ACCEPTED") {
      return res.status(400).json({
        message:
          "Booking must be accepted before starting service",
      });
    }

    if (data.quote_status !== "ACCEPTED") {
      return res.status(400).json({
        message:
          "Customer must accept the repair quote first",
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = 'IN_PROGRESS'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Service started successfully",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const generateCompletionOtp = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.payment_status,
          b.completion_otp
       FROM bookings b
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE b.id = $1
       AND t.user_id = $2`,
      [id, req.user.id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found or not assigned to you",
      });
    }

    const data = booking.rows[0];

    if (data.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Service must be in progress",
      });
    }

    if (data.payment_status !== "PAID") {
      return res.status(400).json({
        message: "Payment is required before completion OTP",
      });
    }

    if (data.completion_otp) {
      return res.json({
        message: "Completion OTP is already generated for the customer",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await pool.query(
      `UPDATE bookings
       SET completion_otp = $1,
           otp_verified = FALSE
       WHERE id = $2`,
      [otp, id],
    );

    res.json({
      message: "Completion OTP generated successfully",
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const verifyCompletionOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required",
      });
    }

    const booking = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.payment_status,
          b.completion_otp,
          b.otp_verified,
          b.technician_id
       FROM bookings b
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE b.id = $1
       AND t.user_id = $2`,
      [id, req.user.id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found or not assigned to you",
      });
    }

    const data = booking.rows[0];

    if (data.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Service is not in progress",
      });
    }

    if (data.payment_status !== "PAID") {
      return res.status(400).json({
        message: "Payment is required before service completion",
      });
    }

    if (data.otp_verified) {
      return res.status(400).json({
        message: "Service is already completed",
      });
    }

    if (data.completion_otp !== otp) {
      return res.status(400).json({
        message: "Invalid completion OTP",
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = 'COMPLETED',
           otp_verified = TRUE,
           completion_otp = NULL
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    res.json({
      message: "Service completed successfully",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getCompletionOtp = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.payment_status,
          b.completion_otp,
          b.user_id,
          u.name AS technician,
          ts.experience_years
       FROM bookings b
       LEFT JOIN technicians t
         ON b.technician_id = t.id
       LEFT JOIN users u
         ON t.user_id = u.id
       LEFT JOIN technician_services ts
         ON ts.technician_id = t.id
        AND ts.service_id = b.service_id
       WHERE b.id = $1
       AND b.user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Service is not in progress",
      });
    }

    if (booking.payment_status !== "PAID") {
      return res.status(400).json({
        message: "Payment is required before completion OTP",
      });
    }

    if (!booking.completion_otp) {
      return res.status(404).json({
        message: "Completion OTP has not been generated yet",
      });
    }

    res.json({
      otp: booking.completion_otp,
      technician: booking.technician,
      experience_years: booking.experience_years,
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const createPaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
          id,
          amount,
          status,
          payment_status,
          quote_status
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.quote_status !== "ACCEPTED") {
      return res.status(400).json({
        message: "Please accept the technician quote before payment",
      });
    }

    if (booking.status !== "ACCEPTED" && booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Payment is allowed only after technician accepts the booking",
      });
    }

    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        message: "Booking is already paid",
      });
    }

    const amount = Math.round(Number(booking.amount) * 100);

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount,
        currency: "INR",
        receipt: `booking_${booking.id}`,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      },
    );

    res.json({
      order_id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("RAZORPAY ERROR:", err.response?.data || err.message);

    res.status(500).json({
      message:
        err.response?.data?.error?.description ||
        "Failed to create payment order",
    });
  }
};
const selectCashPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
          id,
          status,
          payment_status,
          payment_method,
          quote_status
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.quote_status !== "ACCEPTED") {
      return res.status(400).json({
        message: "Please accept the technician quote before payment",
      });
    }

    if (booking.status !== "ACCEPTED" && booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message:
          "Cash payment is allowed only after technician accepts the booking",
      });
    }

    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        message: "Booking is already paid",
      });
    }

    await pool.query(
      `UPDATE bookings
       SET payment_method = 'CASH'
       WHERE id = $1`,
      [id],
    );

    res.json({
      message: "Cash payment selected. Please pay the technician.",
      payment_status: "PENDING",
      payment_method: "CASH",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to select cash payment",
    });
  }
};
const confirmCashPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.amount,
          b.payment_status,
          b.payment_method
       FROM bookings b
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE b.id = $1
       AND t.user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found or not assigned to you",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "ACCEPTED" && booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Cash payment cannot be confirmed for this booking",
      });
    }

    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        message: "Booking is already paid",
      });
    }

    if (booking.payment_method !== "CASH") {
      return res.status(400).json({
        message: "Customer has not selected cash payment",
      });
    }

    const updated = await pool.query(
      `UPDATE bookings
       SET payment_status = 'PAID',
           paid_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    res.json({
      message: "Cash payment confirmed successfully",
      payment_status: "PAID",
      booking: updated.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to confirm cash payment",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Payment details are incomplete",
      });
    }

    const result = await pool.query(
      `SELECT
          id,
          amount,
          status,
          payment_status
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "ACCEPTED" && booking.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Payment is not allowed for this booking",
      });
    }

    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        message: "Booking already paid",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    await pool.query(
      `UPDATE bookings
       SET payment_status = 'PAID',
           payment_method = 'UPI',
           paid_at = CURRENT_TIMESTAMP,
           transaction_id = $1
       WHERE id = $2`,
      [razorpay_payment_id, booking.id],
    );

    res.json({
      message: "Payment successful",
      payment_status: "PAID",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
const submitProblemDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { problem_description } = req.body;

    if (!problem_description || !problem_description.trim()) {
      return res.status(400).json({
        message: "Problem description is required",
      });
    }

    const result = await pool.query(
      `SELECT
          id,
          status,
          technician_id,
          quote_status
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "ACCEPTED") {
      return res.status(400).json({
        message:
          "Problem can be described only after technician accepts the booking",
      });
    }

    if (!booking.technician_id) {
      return res.status(400).json({
        message: "Technician is not assigned",
      });
    }

    if (booking.quote_status !== "NOT_STARTED") {
      return res.status(400).json({
        message: "Problem description has already been submitted",
      });
    }

    const updated = await pool.query(
      `UPDATE bookings
       SET problem_description = $1,
           quote_status = 'WAITING_TECHNICIAN'
       WHERE id = $2
       RETURNING *`,
      [problem_description.trim(), id],
    );

    res.json({
      message: "Problem description submitted successfully",
      booking: updated.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to submit problem description",
    });
  }
};

const sendTechnicianQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quoted_amount } = req.body;

    const amount = Number(quoted_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Please enter a valid repair price",
      });
    }

    const result = await pool.query(
      `SELECT
          b.id,
          b.status,
          b.technician_id,
          b.problem_description,
          b.quote_status
       FROM bookings b
       JOIN technicians t
         ON b.technician_id = t.id
       WHERE b.id = $1
       AND t.user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found or not assigned to you",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "ACCEPTED") {
      return res.status(400).json({
        message: "Quote can be sent only for an accepted booking",
      });
    }

    if (!booking.problem_description) {
      return res.status(400).json({
        message: "Customer has not submitted the problem description",
      });
    }

    if (booking.quote_status !== "WAITING_TECHNICIAN") {
      return res.status(400).json({
        message: "Quote cannot be sent at this stage",
      });
    }

    const updated = await pool.query(
      `UPDATE bookings
       SET quoted_amount = $1,
           quote_status = 'QUOTED'
       WHERE id = $2
       RETURNING *`,
      [amount, id],
    );

    res.json({
      message: "Repair quote sent successfully",
      quoted_amount: amount,
      booking: updated.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to send repair quote",
    });
  }
};
const acceptTechnicianQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
          id,
          status,
          quoted_amount,
          quote_status
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = result.rows[0];

    if (booking.status !== "ACCEPTED") {
      return res.status(400).json({
        message:
          "Quote can only be accepted for an accepted booking",
      });
    }

    if (booking.quote_status !== "QUOTED") {
      return res.status(400).json({
        message: "No quote is available",
      });
    }

    if (
      booking.quoted_amount === null ||
      Number(booking.quoted_amount) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid quoted amount",
      });
    }

    const updated = await pool.query(
      `UPDATE bookings
       SET amount = quoted_amount,
           quote_status = 'ACCEPTED'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message:
        "Repair quote accepted successfully",
      booking: updated.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to accept quote",
    });
  }
};

const rejectTechnicianQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE bookings
       SET quote_status = 'REJECTED',
           status = 'CANCELLED'
       WHERE id = $1
       AND user_id = $2
       AND status = 'ACCEPTED'
       AND quote_status = 'QUOTED'
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message:
          "Quote cannot be rejected at this stage",
      });
    }

    res.json({
      message: "Repair quote rejected",
      booking: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to reject quote",
    });
  }
};

module.exports = {
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
};

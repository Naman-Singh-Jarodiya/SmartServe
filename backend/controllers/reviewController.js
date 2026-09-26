const pool = require("../config/db");

const createReview = async (req, res) => {
    try {
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || !rating) {
            return res.status(400).json({
                message: "Booking and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const booking = await pool.query(
            `SELECT id
             FROM bookings
             WHERE id = $1
             AND user_id = $2
             AND status = 'COMPLETED'`,
            [booking_id, req.user.id]
        );

        if (booking.rows.length === 0) {
            return res.status(400).json({
                message: "You can review only your completed booking"
            });
        }

        const existing = await pool.query(
            "SELECT id FROM reviews WHERE booking_id = $1",
            [booking_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Review already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO reviews
             (booking_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [booking_id, req.user.id, rating, comment || null]
        );

        res.status(201).json({
            message: "Review created successfully",
            review: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getServiceReviews = async (req, res) => {
    try {
        const { service_id } = req.params;

        const result = await pool.query(
            `SELECT
                r.id,
                u.name AS customer,
                r.rating,
                r.comment,
                r.created_at
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN bookings b ON r.booking_id = b.id
             WHERE b.service_id = $1
             ORDER BY r.created_at DESC`,
            [service_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createReview,
    getServiceReviews
};
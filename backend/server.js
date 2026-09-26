require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const addressRoutes = require("./routes/addressRoutes");

const app = express();

app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/addresses", addressRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "SmartServe backend is running"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "API is working"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
            [req.user.id]
        );

        res.json({
            user: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

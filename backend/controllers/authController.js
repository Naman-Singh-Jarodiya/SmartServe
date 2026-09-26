const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const register = async (req, res) => {
  try {
    const { name, email, password, role, services } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }
    const allowedRoles = ["CUSTOMER", "TECHNICIAN"];

    const userRole = role || "CUSTOMER";

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, userRole],
    );
    if (userRole === "TECHNICIAN") {
      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
          message: "Technician must select at least one service",
        });
      }

      const technicianResult = await pool.query(
        `INSERT INTO technicians (user_id)
         VALUES ($1)
         RETURNING id`,
        [result.rows[0].id],
      );

      const technicianId = technicianResult.rows[0].id;

      for (const service of services) {
        if (!service.service_id || service.experience_years === undefined) {
          return res.status(400).json({
            message: "Invalid technician service data",
          });
        }

        await pool.query(
          `INSERT INTO technician_services
             (technician_id, service_id, experience_years)
             VALUES ($1, $2, $3)`,
          [technicianId, service.service_id, service.experience_years],
        );
      }
    }
    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { register, login };

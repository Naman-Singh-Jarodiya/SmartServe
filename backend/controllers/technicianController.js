const pool = require("../config/db");

const getTechniciansByService = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { booking_id } = req.query;

    if (!booking_id) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const booking = await pool.query(
      `SELECT
          latitude,
          longitude
       FROM bookings
       WHERE id = $1
       AND user_id = $2`,
      [booking_id, req.user.id],
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const customerLat = Number(booking.rows[0].latitude);

    const customerLng = Number(booking.rows[0].longitude);

    const result = await pool.query(
      `SELECT
          t.id AS technician_id,
          u.name,
          u.email,
          ts.experience_years,

          COALESCE(
            ROUND(AVG(r.rating), 1),
            0
          ) AS average_rating,

          COUNT(r.id)::INTEGER AS rating_count,

          a.latitude AS technician_latitude,
          a.longitude AS technician_longitude,

          CASE
            WHEN a.latitude IS NOT NULL
             AND a.longitude IS NOT NULL
            THEN ROUND(
              (
                6371 * 2 * ASIN(
                  SQRT(
                    POWER(
                      SIN(
                        RADIANS(a.latitude - $2) / 2
                      ),
                      2
                    )
                    +
                    COS(RADIANS($2))
                    *
                    COS(RADIANS(a.latitude))
                    *
                    POWER(
                      SIN(
                        RADIANS(a.longitude - $3) / 2
                      ),
                      2
                    )
                  )
                )
              )::NUMERIC,
              1
            )
            ELSE NULL
          END AS distance_km

       FROM technicians t

       JOIN users u
         ON t.user_id = u.id

       JOIN technician_services ts
         ON ts.technician_id = t.id
        AND ts.service_id = $1

       LEFT JOIN addresses a
         ON a.user_id = t.user_id
        AND a.is_selected = TRUE

       LEFT JOIN bookings b
         ON b.technician_id = t.id
        AND b.service_id = $1
        AND b.status = 'COMPLETED'

       LEFT JOIN reviews r
         ON r.booking_id = b.id

       GROUP BY
          t.id,
          u.name,
          u.email,
          ts.experience_years,
          a.latitude,
          a.longitude

       ORDER BY
          distance_km ASC NULLS LAST,
          average_rating DESC,
          rating_count DESC,
          ts.experience_years DESC`,
      [service_id, customerLat, customerLng],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch technicians",
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT
                id,
                name,
                email
             FROM users
             WHERE id = $1`,
      [req.user.id],
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    const services = await pool.query(
      `SELECT
                s.id AS service_id,
                s.name AS service,
                EXTRACT(
                    YEAR FROM AGE(
                        CURRENT_DATE,
                        ts.experience_started_at
                    )
                )::INTEGER AS experience_years,
                COALESCE(
                    ROUND(AVG(r.rating), 1),
                    0
                ) AS average_rating,
                COUNT(r.id)::INTEGER AS rating_count
             FROM technician_services ts
             JOIN services s
               ON ts.service_id = s.id
             LEFT JOIN bookings b
               ON b.technician_id = ts.technician_id
              AND b.service_id = ts.service_id
              AND b.status = 'COMPLETED'
             LEFT JOIN reviews r
               ON r.booking_id = b.id
             WHERE ts.technician_id = (
                 SELECT id
                 FROM technicians
                 WHERE user_id = $1
             )
             GROUP BY
                s.id,
                s.name,
                ts.experience_started_at
             ORDER BY s.name`,
      [req.user.id],
    );

    res.json({
      name: user.rows[0].name,
      email: user.rows[0].email,
      services: services.rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load profile",
    });
  }
};
const addTechnicianService = async (req, res) => {
  try {
    const { service_id, experience_years } = req.body;

    const years = Number(experience_years);

    if (!service_id) {
      return res.status(400).json({
        message: "Service is required",
      });
    }

    if (!Number.isInteger(years) || years < 0 || years > 60) {
      return res.status(400).json({
        message: "Experience must be a valid number of years",
      });
    }

    const technicianResult = await pool.query(
      `SELECT id
             FROM technicians
             WHERE user_id = $1`,
      [req.user.id],
    );

    if (technicianResult.rows.length === 0) {
      return res.status(404).json({
        message: "Technician profile not found",
      });
    }

    const technicianId = technicianResult.rows[0].id;

    const serviceResult = await pool.query(
      `SELECT id, name
             FROM services
             WHERE id = $1`,
      [service_id],
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const existingResult = await pool.query(
      `SELECT id
             FROM technician_services
             WHERE technician_id = $1
             AND service_id = $2`,
      [technicianId, service_id],
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        message: "Service already added",
      });
    }

    const result = await pool.query(
      `INSERT INTO technician_services
                (
                    technician_id,
                    service_id,
                    experience_years,
                    experience_started_at
                )
             VALUES
                (
                    $1,
                    $2,
                    $3,
                    CURRENT_DATE - make_interval(years => $3::integer)
                )
             RETURNING *`,
      [technicianId, service_id, years],
    );

    res.status(201).json({
      message: "Service added successfully",
      service: result.rows[0],
    });
  } catch (err) {
    console.error("ADD TECHNICIAN SERVICE ERROR:", err);

    res.status(500).json({
      message: err.message || "Failed to add service",
    });
  }
};
const getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
                br.id AS request_id,
                br.booking_id,
                br.status AS request_status,
                br.created_at AS request_created_at,

                b.booking_date,
                b.amount,
                b.status AS booking_status,
                b.problem_description,
                b.quoted_amount,
                b.quote_status,

                u.name AS customer,
                u.email AS customer_email,

                s.name AS service,

                ts.experience_years

             FROM booking_requests br

             JOIN bookings b
               ON br.booking_id = b.id

             JOIN users u
               ON b.user_id = u.id

             JOIN services s
               ON b.service_id = s.id

             JOIN technicians t
               ON br.technician_id = t.id

             LEFT JOIN technician_services ts
               ON ts.technician_id = t.id
              AND ts.service_id = b.service_id

             WHERE t.user_id = $1

             ORDER BY br.created_at DESC`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to load technician requests",
    });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid request status",
      });
    }

    const request = await pool.query(
      `SELECT
                br.id,
                br.booking_id,
                br.technician_id,
                br.status
             FROM booking_requests br
             JOIN technicians t
               ON br.technician_id = t.id
             WHERE br.id = $1
             AND t.user_id = $2`,
      [id, req.user.id],
    );

    if (request.rows.length === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.rows[0].status !== "PENDING") {
      return res.status(400).json({
        message: "Request has already been processed",
      });
    }

    const bookingId = request.rows[0].booking_id;
    const technicianId = request.rows[0].technician_id;

    if (status === "ACCEPTED") {
      await pool.query(
        `UPDATE booking_requests
                 SET status = 'ACCEPTED'
                 WHERE id = $1`,
        [id],
      );

      await pool.query(
        `UPDATE bookings
                 SET technician_id = $1,
                     status = 'ACCEPTED'
                 WHERE id = $2
                 AND status = 'PENDING'`,
        [technicianId, bookingId],
      );

      await pool.query(
        `UPDATE booking_requests
                 SET status = 'REJECTED'
                 WHERE booking_id = $1
                 AND id != $2
                 AND status = 'PENDING'`,
        [bookingId, id],
      );
    } else {
      await pool.query(
        `UPDATE booking_requests
                 SET status = 'REJECTED'
                 WHERE id = $1`,
        [id],
      );
    }

    res.json({
      message: `Request ${status.toLowerCase()} successfully`,
    });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getTechniciansByService,
  getMyProfile,
  getMyRequests,
  respondToRequest,
  addTechnicianService,
};

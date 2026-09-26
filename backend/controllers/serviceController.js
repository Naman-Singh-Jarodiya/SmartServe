const pool = require("../config/db");

const getServices = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM services ORDER BY id"
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getService = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM services WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const createService = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                message: "Name and description are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO services (name, description)
             VALUES ($1, $2)
             RETURNING *`,
            [name.trim(), description.trim()]
        );

        res.status(201).json({
            message: "Service created successfully",
            service: result.rows[0]
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;

        const result = await pool.query(
            `UPDATE services
             SET name = $1,
                 description = $2,
                 price = $3
             WHERE id = $4
             RETURNING *`,
            [name, description || null, price, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service updated successfully",
            service: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM services WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service deleted successfully"
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
};
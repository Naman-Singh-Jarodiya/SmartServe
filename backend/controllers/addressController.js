const pool = require("../config/db");

const getAddresses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          label,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_selected,
          created_at
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_selected DESC, created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch addresses",
    });
  }
};

const autocompleteAddress = async (req, res) => {
  try {
    const { text } = req.query;

    if (!text || text.trim().length < 3) {
      return res.json([]);
    }

    const params = new URLSearchParams({
      text: text.trim(),
      limit: "5",
      format: "json",
      filter: "countrycode:in",
      apiKey: process.env.GEOAPIFY_API_KEY,
    });

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?${params}`
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Geoapify error:", errorText);

      return res.status(500).json({
        message: "Address search failed",
      });
    }

    const data = await response.json();

    const results = (data.results || []).map((item) => ({
      formatted: item.formatted || "",
      address_line1: item.address_line1 || "",
      address_line2: item.address_line2 || "",
      city: item.city || "",
      state: item.state || "",
      postcode: item.postcode || "",
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }));

    res.json(results);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to search address",
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const {
      label,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
    } = req.body;

    if (
      !label ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All address and location fields are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO addresses
        (
          user_id,
          label,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          is_selected
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
       RETURNING *`,
      [
        req.user.id,
        label,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
      ]
    );

    res.status(201).json({
      message: "Address added successfully",
      address: result.rows[0],
    });
  }  catch (err) {
  console.error("ADD ADDRESS ERROR:", err);

  res.status(500).json({
    message: err.message,
    detail: err.detail || null,
    code: err.code || null,
  });
}
};

const selectAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      `SELECT id
       FROM addresses
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await pool.query(
      `UPDATE addresses
       SET is_selected = FALSE
       WHERE user_id = $1`,
      [req.user.id]
    );

    const result = await pool.query(
      `UPDATE addresses
       SET is_selected = TRUE
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    res.json({
      message: "Address selected successfully",
      address: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to select address",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM addresses
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.json({
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to delete address",
    });
  }
};

module.exports = {
  getAddresses,
  autocompleteAddress,
  addAddress,
  selectAddress,
  deleteAddress,
};
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAddresses,
  autocompleteAddress,
  addAddress,
  selectAddress,
  deleteAddress,
} = require("../controllers/addressController");

router.get(
  "/",
  authMiddleware,
  getAddresses
);

router.get(
  "/autocomplete",
  authMiddleware,
  autocompleteAddress
);

router.post(
  "/",
  authMiddleware,
  addAddress
);

router.put(
  "/:id/select",
  authMiddleware,
  selectAddress
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAddress
);

module.exports = router;
const express = require("express");

const {
    createReview,
    getServiceReviews
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    createReview
);

router.get(
    "/service/:service_id",
    getServiceReviews
);

module.exports = router;
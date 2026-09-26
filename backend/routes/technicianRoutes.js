const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getTechniciansByService,
    getMyProfile,
    getMyRequests,
    respondToRequest,
    addTechnicianService
} = require("../controllers/technicianController");

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("TECHNICIAN"),
    getMyProfile
);

router.get(
    "/requests",
    authMiddleware,
    roleMiddleware("TECHNICIAN"),
    getMyRequests
);

router.put(
    "/requests/:id/respond",
    authMiddleware,
    roleMiddleware("TECHNICIAN"),
    respondToRequest
);

router.get(
    "/service/:service_id",
    authMiddleware,
    roleMiddleware("CUSTOMER", "ADMIN"),
    getTechniciansByService
);

router.post(
    "/services",
    authMiddleware,
    roleMiddleware("TECHNICIAN"),
    addTechnicianService
);

module.exports = router;
const express = require("express");

const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
} = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getServices);

router.get("/:id", getService);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createService
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateService
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteService
);

module.exports = router;
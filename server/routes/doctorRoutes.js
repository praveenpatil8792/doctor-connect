const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById,
    deleteDoctorProfile,
    updateAvailability
} = require("../controllers/doctorController");

router.post(
    "/create-profile",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    createDoctorProfile
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    getDoctorProfile
);

router.put(
    "/update-profile",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    updateDoctorProfile
);

router.get("/all", getAllDoctors);

router.get("/:id", getDoctorById);

router.delete(
    "/profile",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    deleteDoctorProfile
);

router.put(

    "/availability",

    authMiddleware,

    roleMiddleware(ROLES.DOCTOR),

    updateAvailability

);

module.exports = router;
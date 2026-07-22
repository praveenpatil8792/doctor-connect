const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const {

    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment

} = require("../controllers/appointmentController");

router.post(

    "/book",

    authMiddleware,

    roleMiddleware(ROLES.PATIENT),

    bookAppointment

);

router.get(
    "/my-appointments",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    getMyAppointments
);

router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    getDoctorAppointments
);

router.put(

    "/status/:id",

    authMiddleware,

    roleMiddleware(ROLES.DOCTOR),

    updateAppointmentStatus

);

router.put(
    "/cancel/:id",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    cancelAppointment
);

module.exports = router;
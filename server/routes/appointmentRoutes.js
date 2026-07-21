const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const {

    bookAppointment

} = require("../controllers/appointmentController");

router.post(

    "/book",

    authMiddleware,

    roleMiddleware(ROLES.PATIENT),

    bookAppointment

);

module.exports = router;
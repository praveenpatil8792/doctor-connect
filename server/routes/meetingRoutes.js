const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const { getMeetingDetails } = require("../controllers/meetingController");

router.get(
    "/:appointmentId",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT, ROLES.DOCTOR),
    getMeetingDetails
);

module.exports = router;

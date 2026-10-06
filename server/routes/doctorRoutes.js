const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const upload = require("../middleware/uploadMiddleware");
const { createDoctorProfile,getDoctorProfile,updateDoctorProfile,getAllDoctors,getDoctorById,deleteDoctorProfile,getAvailability,generateAvailabilitySlots,updateAvailability,uploadProfilePhoto,getDoctorSlots,updateHospitalLocation } = require("../controllers/doctorController");

router.post("/create-profile", authMiddleware, roleMiddleware(ROLES.DOCTOR), createDoctorProfile);
router.get("/profile", authMiddleware, roleMiddleware(ROLES.DOCTOR), getDoctorProfile);
router.put("/update-profile", authMiddleware, roleMiddleware(ROLES.DOCTOR), updateDoctorProfile);
router.get("/availability", authMiddleware, roleMiddleware(ROLES.DOCTOR), getAvailability);
router.post("/availability/generate-slots", authMiddleware, roleMiddleware(ROLES.DOCTOR), generateAvailabilitySlots);
router.put("/availability", authMiddleware, roleMiddleware(ROLES.DOCTOR), updateAvailability);
router.put("/location", authMiddleware, roleMiddleware(ROLES.DOCTOR), updateHospitalLocation);
router.put("/upload-photo", authMiddleware, roleMiddleware(ROLES.DOCTOR), upload.single("profileImage"), uploadProfilePhoto);
router.get("/all", getAllDoctors);
router.delete("/profile", authMiddleware, roleMiddleware(ROLES.DOCTOR), deleteDoctorProfile);
router.get("/:id/slots", getDoctorSlots);
router.get("/:id", getDoctorById);

module.exports = router;

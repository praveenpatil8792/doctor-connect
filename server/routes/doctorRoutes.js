const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const upload = require("../middleware/uploadMiddleware");

const {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById,
    deleteDoctorProfile,
    getAvailability,
    updateAvailability,
    uploadProfilePhoto,
    getDoctorSlots
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

router.get(
    "/:id/slots",
    getDoctorSlots
);


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

// #swagger.tags = ['Doctors']
// #swagger.summary = 'Upload Doctor Profile Photo'
// #swagger.consumes = ['multipart/form-data']
// #swagger.security = [{
//     "BearerAuth":[]
// }]

router.put(

    "/upload-photo",

    authMiddleware,

    roleMiddleware(ROLES.DOCTOR),

    upload.single("profileImage"),

    uploadProfilePhoto

);

router.get(
    "/availability",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    getAvailability
);


module.exports = router;
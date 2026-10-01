const express = require("express");

const router = express.Router();

const {
    createReview,
    updateReview,
    deleteReview,
    getDoctorReviews,
    getMyReviews,
    getLoggedInDoctorReviews
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = {
    PATIENT: "patient",
    DOCTOR: "doctor"
};


// =====================================================
// CREATE REVIEW
// =====================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    createReview
);


// =====================================================
// UPDATE REVIEW
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    updateReview
);


// =====================================================
// DELETE REVIEW
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    deleteReview
);


// =====================================================
// PATIENT REVIEWS
// =====================================================

router.get(
    "/my-reviews",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    getMyReviews
);


// =====================================================
// DOCTOR REVIEWS
// =====================================================

router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware(ROLES.DOCTOR),
    getLoggedInDoctorReviews
);


// =====================================================
// REVIEWS OF SPECIFIC DOCTOR
// =====================================================

router.get(
    "/doctor/:doctorId",
    getDoctorReviews
);


module.exports = router;
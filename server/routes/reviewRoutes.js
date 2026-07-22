const express = require("express");

const router = express.Router();

const { createReview,
        updateReview,
        deleteReview,
        getDoctorReviews,
        getMyReviews
      } = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

router.post(

    "/",

    authMiddleware,

    roleMiddleware(ROLES.PATIENT),

    createReview,

);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    updateReview
);

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware(ROLES.PATIENT),

    deleteReview

);

router.get(

    "/doctor/:doctorId",

    getDoctorReviews

);

router.get(

    "/my-reviews",

    authMiddleware,

    roleMiddleware(ROLES.PATIENT),

    getMyReviews

);

module.exports = router;
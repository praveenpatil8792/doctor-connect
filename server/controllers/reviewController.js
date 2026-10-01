const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// =====================================================
// CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
    try {
        const {
            appointmentId,
            rating,
            comment
        } = req.body;

        // Validate appointment ID
        if (!appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Appointment ID is required"
            });
        }

        // Validate rating
        if (rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Find appointment
        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check appointment belongs to logged-in patient
        if (
            appointment.patient.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to review this appointment"
            });
        }

        // Review allowed only for Completed or Rejected
        if (
            appointment.status !== "Completed" &&
            appointment.status !== "Rejected"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Review allowed only for completed or rejected appointments"
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            appointment: appointmentId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted"
            });
        }

        // Create review
        const review = await Review.create({
            appointment: appointmentId,
            doctor: appointment.doctor,
            patient: req.user.id,
            rating: Number(rating),
            comment: comment || ""
        });

        // ---------------------------------------------
        // RECALCULATE DOCTOR AVERAGE RATING
        // ---------------------------------------------

        const doctorReviews = await Review.find({
            doctor: appointment.doctor
        });

        const totalRating = doctorReviews.reduce(
            (sum, item) => sum + Number(item.rating),
            0
        );

        const averageRating =
            doctorReviews.length > 0
                ? totalRating / doctorReviews.length
                : 0;

        // ---------------------------------------------
        // UPDATE DOCTOR
        // ---------------------------------------------

        await Doctor.findByIdAndUpdate(
            appointment.doctor,
            {
                averageRating: Number(
                    averageRating.toFixed(1)
                ),
                totalReviews: doctorReviews.length
            }
        );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review,
            averageRating: Number(
                averageRating.toFixed(1)
            ),
            totalReviews: doctorReviews.length
        });

    } catch (error) {
        console.error(
            "Create review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create review"
        });
    }
};


// =====================================================
// UPDATE REVIEW
// =====================================================

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            rating,
            comment
        } = req.body;

        // Validate rating
        if (rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Find review
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check review belongs to logged-in patient
        if (
            review.patient.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to edit this review"
            });
        }

        // ---------------------------------------------
        // UPDATE THE REVIEW
        // ---------------------------------------------

        review.rating = Number(rating);
        review.comment = comment || "";

        await review.save();

        // ---------------------------------------------
        // GET ALL REVIEWS FOR THIS DOCTOR
        // ---------------------------------------------

        const doctorReviews = await Review.find({
            doctor: review.doctor
        });

        // ---------------------------------------------
        // CALCULATE NEW AVERAGE
        // ---------------------------------------------

        const totalRating = doctorReviews.reduce(
            (sum, item) => sum + Number(item.rating),
            0
        );

        const averageRating =
            doctorReviews.length > 0
                ? totalRating / doctorReviews.length
                : 0;

        // ---------------------------------------------
        // UPDATE DOCTOR AVERAGE RATING
        // ---------------------------------------------

        await Doctor.findByIdAndUpdate(
            review.doctor,
            {
                averageRating: Number(
                    averageRating.toFixed(1)
                ),
                totalReviews: doctorReviews.length
            }
        );

        // ---------------------------------------------
        // SEND RESPONSE
        // ---------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",

            review,

            averageRating: Number(
                averageRating.toFixed(1)
            ),

            totalReviews: doctorReviews.length
        });

    } catch (error) {
        console.error(
            "Update review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update review"
        });
    }
};


// =====================================================
// DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check ownership
        if (
            review.patient.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this review"
            });
        }

        const doctorId = review.doctor;

        await Review.findByIdAndDelete(id);

        // ---------------------------------------------
        // RECALCULATE DOCTOR RATING
        // ---------------------------------------------

        const doctorReviews = await Review.find({
            doctor: doctorId
        });

        const totalRating = doctorReviews.reduce(
            (sum, item) => sum + Number(item.rating),
            0
        );

        const averageRating =
            doctorReviews.length > 0
                ? totalRating / doctorReviews.length
                : 0;

        await Doctor.findByIdAndUpdate(
            doctorId,
            {
                averageRating: Number(
                    averageRating.toFixed(1)
                ),
                totalReviews: doctorReviews.length
            }
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete review error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to delete review"
        });
    }
};


// =====================================================
// GET DOCTOR REVIEWS
// =====================================================

const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const reviews = await Review.find({
            doctor: doctorId
        })
            .populate(
                "patient",
                "name profileImage"
            )
            .populate(
                "appointment",
                "appointmentDate startTime"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error(
            "Get doctor reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to get doctor reviews"
        });
    }
};


// =====================================================
// GET MY REVIEWS
// =====================================================

const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            patient: req.user.id
        })
            .populate(
                "doctor",
                "specialization averageRating totalReviews"
            )
            .populate(
                "appointment",
                "appointmentDate startTime status"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        console.error(
            "Get my reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to get your reviews"
        });
    }
};


// =====================================================
// GET LOGGED-IN DOCTOR REVIEWS
// =====================================================

const getLoggedInDoctorReviews = async (req, res) => {

    try {

        // Find doctor profile
        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {

            return res.status(404).json({

                success: false,

                message: "Doctor profile not found"

            });

        }


        // Get reviews
        const reviews = await Review.find({
            doctor: doctor._id
        })
            .populate(
                "patient",
                "name profileImage"
            )
            .populate(
                "appointment",
                "appointmentDate startTime"
            )
            .sort({
                createdAt: -1
            });


        // Calculate average rating
        const totalRating = reviews.reduce(
            (sum, review) =>
                sum + Number(review.rating),
            0
        );


        const averageRating =
            reviews.length > 0
                ? totalRating / reviews.length
                : 0;


        return res.status(200).json({

            success: true,

            reviews,

            averageRating: Number(
                averageRating.toFixed(1)
            ),

            totalReviews: reviews.length

        });

    }

    catch (error) {

        console.error(
            "Get logged-in doctor reviews error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Unable to get doctor reviews"

        });

    }

};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getDoctorReviews,
    getMyReviews,
    getLoggedInDoctorReviews
};
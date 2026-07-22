const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const updateDoctorRating = require("../utils/updateDoctorRating");

const createReview = async (req, res) => {

    try {

        const {
            appointmentId,
            rating,
            comment
        } = req.body;

        if (!appointmentId || !rating) {

            return res.status(400).json({
                success: false,
                message: "Appointment ID and Rating are required"
            });

        }

        if (rating < 1 || rating > 5) {

            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });

        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });

        }

        // Only patient who booked

        if (appointment.patient.toString() !== req.user.id) {

            return res.status(403).json({
                success: false,
                message: "Access Forbidden"
            });

        }

        // Only completed appointments

        if (appointment.status !== "Completed") {

            return res.status(400).json({
                success: false,
                message: "Review allowed only after completed appointment"
            });

        }

        // Only one review

        const existing = await Review.findOne({
            appointment: appointmentId
        });

        if (existing) {

            return res.status(400).json({
                success: false,
                message: "Review already submitted"
            });

        }

        const review = await Review.create({

            appointment: appointmentId,

            doctor: appointment.doctor,

            patient: req.user.id,

            rating,

            comment

        });

        await updateDoctorRating(appointment.doctor);

        res.status(201).json({

            success: true,

            message: "Review Submitted Successfully",

            review

        });

    }


    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Update Review

const updateReview = async (req, res) => {

    try {

        const { id } = req.params;

        const { rating, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found"
            });

        }

        // Only review owner can update

        if (review.patient.toString() !== req.user.id) {

            return res.status(403).json({
                success: false,
                message: "Access Forbidden"
            });

        }

        if (rating) {

            if (rating < 1 || rating > 5) {

                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5"
                });

            }

            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        // Recalculate doctor's rating

        await updateDoctorRating(review.doctor);

        res.status(200).json({

            success: true,
            message: "Review Updated Successfully",
            review

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Review

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

        // Only review owner

        if (review.patient.toString() !== req.user.id) {

            return res.status(403).json({

                success: false,

                message: "Access Forbidden"

            });

        }

        const doctorId = review.doctor;

        await review.deleteOne();

        await updateDoctorRating(doctorId);

        res.status(200).json({

            success: true,

            message: "Review Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Get Doctor Reviews

const getDoctorReviews = async (req, res) => {

    try {

        const { doctorId } = req.params;

        const reviews = await Review.find({

            doctor: doctorId

        })

        .populate("patient", "name profileImage")

        .sort({

            createdAt: -1

        });

        res.status(200).json({

            success: true,

            totalReviews: reviews.length,

            reviews

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getMyReviews = async (req, res) => {

    try {

        const reviews = await Review.find({

            patient: req.user.id

        })

        .populate({

            path: "doctor",

            populate: {

                path: "user",

                select: "name profileImage"

            }

        });

        res.status(200).json({

            success: true,

            totalReviews: reviews.length,

            reviews

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getDoctorReviews,
    getMyReviews
};
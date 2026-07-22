const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

const updateDoctorRating = async (doctorId) => {

    const reviews = await Review.find({
        doctor: doctorId
    });

    const totalReviews = reviews.length;

    let averageRating = 0;

    if (totalReviews > 0) {

        const totalRating = reviews.reduce((sum, review) => {

            return sum + review.rating;

        }, 0);

        averageRating = totalRating / totalReviews;

    }

    await Doctor.findByIdAndUpdate(

        doctorId,

        {
            averageRating: Number(averageRating.toFixed(1)),
            totalReviews
        }

    );

};

module.exports = updateDoctorRating;
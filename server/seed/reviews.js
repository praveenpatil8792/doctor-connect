const Review = require("../models/Review");
const { faker } = require("@faker-js/faker");
const updateDoctorRating = require("../utils/updateDoctorRating");

const createReviews = async (appointments) => {

    const completedAppointments = appointments.filter(

        appointment => appointment.status === "Completed"

    );

    const reviews = [];

    for (

        let i = 0;

        i < Math.min(30, completedAppointments.length);

        i++

    ) {

        const appointment = completedAppointments[i];

        const review = await Review.create({

            patient: appointment.patient,

            doctor: appointment.doctor,

            appointment: appointment._id,

            rating: faker.number.int({

                min: 3,

                max: 5

            }),

            comment: faker.lorem.sentences(2)

        });

        reviews.push(review);

        await updateDoctorRating(appointment.doctor);

    }

    return reviews;

};

module.exports = createReviews;
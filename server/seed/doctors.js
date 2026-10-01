const Doctor = require("../models/Doctor");
const { faker } = require("@faker-js/faker");

const specializations = [

    "Cardiologist",

    "Dermatologist",

    "Orthopedic",

    "Neurologist",

    "Dentist"

];

const createDoctors = async (users) => {

    const doctorUsers = users.filter(

        user => user.role === "doctor"

    );

    const doctors = [];

    doctorUsers.forEach((user, index) => {

        doctors.push({

            user: user._id,

            specialization: specializations[index],

            qualification: "MBBS, MD",

            experience: faker.number.int({

                min: 3,

                max: 20

            }),

            consultationFee: faker.number.int({

                min: 400,

                max: 1500

            }),

            hospital: faker.company.name(),

            about: faker.lorem.sentences(2),

            available: true

        });

    });

    return await Doctor.insertMany(doctors);

};

module.exports = createDoctors;
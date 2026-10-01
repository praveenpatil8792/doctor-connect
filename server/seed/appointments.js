const Appointment = require("../models/Appointment");
const { faker } = require("@faker-js/faker");

const createAppointments = async (users, doctors) => {

    const patients = users.filter(

        user => user.role === "patient"

    );

    const appointments = [];

    const status = [

        "Pending",

        "Accepted",

        "Completed",

        "Cancelled"

    ];

    for (let i = 0; i < 50; i++) {

        const patient = faker.helpers.arrayElement(patients);

        const doctor = faker.helpers.arrayElement(doctors);

        appointments.push({

            patient: patient._id,

            doctor: doctor._id,

            appointmentDate: faker.date.soon(),

            startTime: "10:00",

            endTime: "10:30",

            mode: faker.helpers.arrayElement([
                "Online",
                "Offline"
            ]),

            reason: faker.lorem.words(4),

            status: faker.helpers.arrayElement(status)

        });

    }

    return await Appointment.insertMany(appointments);

};

module.exports = createAppointments;
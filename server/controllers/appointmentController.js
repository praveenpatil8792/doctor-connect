const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Book Appointment

const bookAppointment = async (req, res) => {

    try {

        const {
             doctorId,
             appointmentDate,
             startTime,
             endTime,
             mode,
             reason
        } = req.body;

        // Check if doctor exists

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {

            return res.status(404).json({

                success: false,

                message: "Doctor not found"

            });

        }

        // Create appointment

        const appointment = await Appointment.create({

            patient: req.user.id,

            doctor: doctorId,

            appointmentDate,

            startTime,

            endTime,

            mode,

            reason

        });

        res.status(201).json({

            success: true,

            message: "Appointment Booked Successfully",

            appointment

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

    bookAppointment

};
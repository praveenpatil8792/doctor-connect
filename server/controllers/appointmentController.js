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

// Get Logged-in Patient Appointments

const getMyAppointments = async (req, res) => {

    try {

        const appointments = await Appointment.find({
            patient: req.user.id
        })
        .populate({
            path: "doctor",
            populate: {
                path: "user",
                select: "name email phone profileImage"
            }
        })
        .sort({
            appointmentDate: -1
        });

        res.status(200).json({

            success: true,

            totalAppointments: appointments.length,

            appointments

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Get Doctor Appointments

const getDoctorAppointments = async (req, res) => {

    try {

        // Find doctor's profile
        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        const appointments = await Appointment.find({
            doctor: doctor._id
        })
        .populate("patient", "name email phone profileImage")
        .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Accept Appointment

// Update Appointment Status

const updateAppointmentStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        const allowedStatus = [
            "Accepted",
            "Rejected",
            "Completed",
            "Cancelled"
        ];

        if (!allowedStatus.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid Appointment Status"

            });

        }

        // Find Doctor Profile

        const doctor = await Doctor.findOne({

            user: req.user.id

        });

        if (!doctor) {

            return res.status(404).json({

                success: false,

                message: "Doctor profile not found"

            });

        }

        // Find Appointment

        const appointment = await Appointment.findById(id);

        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: "Appointment not found"

            });

        }

        // Check Ownership

        if (appointment.doctor.toString() !== doctor._id.toString()) {

            return res.status(403).json({

                success: false,

                message: "Access Forbidden"

            });

        }

        // Valid Status Transitions

        const validTransitions = {

            Pending: ["Accepted", "Rejected"],

            Accepted: ["Completed"],

            Rejected: [],

            Completed: [],

            Cancelled: []

        };

        if (!validTransitions[appointment.status].includes(status)) {

            return res.status(400).json({

            success: false,

            message: `Cannot change appointment from ${appointment.status} to ${status}`

        });

    }

    appointment.status = status;

    await appointment.save();

        res.status(200).json({

            success: true,

            message: `Appointment ${status}`,

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

// Cancel Appointment

const cancelAppointment = async (req, res) => {

    try {

        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });

        }

        // Check ownership

        if (appointment.patient.toString() !== req.user.id) {

            return res.status(403).json({
                success: false,
                message: "Access Forbidden"
            });

        }

        if (appointment.status !== "Pending") {

            return res.status(400).json({
                success: false,
                message: "Only pending appointments can be cancelled"
            });

        }

        appointment.status = "Cancelled";

        await appointment.save();

        res.status(200).json({

            success: true,
            message: "Appointment Cancelled Successfully",
            appointment

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {

    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment

};
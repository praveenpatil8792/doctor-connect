const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { refundAppointmentPayment } = require("../services/refundService");


const updateExpiredAppointments = async () => {
    try {
        const appointments = await Appointment.find({
            status: {
                $in: ["Pending", "Accepted"]
            }
        });

        const now = new Date();

        for (const appointment of appointments) {
            const appointmentDate = new Date(appointment.appointmentDate);

            const [hours, minutes] = appointment.startTime
                .split(":")
                .map(Number);

            appointmentDate.setHours(hours, minutes, 0, 0);

            if (appointmentDate < now) {
                appointment.status = "Expired";
                await appointment.save();
            }
        }
    } catch (error) {
        console.error(
            "Error updating expired appointments:",
            error.message
        );
    }
};

// Book Appointment

// =====================================================
// Book Appointment
// =====================================================

const bookAppointment = async (req, res) => {

    try {

        const {

            doctorId,

            appointmentDate,

            startTime,

            mode,

            reason

        } = req.body;


        // =================================================
        // 1. Validate required fields
        // =================================================

        if (
            !doctorId ||
            !appointmentDate ||
            !startTime ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor, date, time and reason are required"

            });

        }


        // =================================================
        // 2. Validate date format
        // =================================================

        const datePattern =
            /^\d{4}-\d{2}-\d{2}$/;


        if (
            !datePattern.test(
                appointmentDate
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid appointment date format"

            });

        }


        // =================================================
        // 3. Convert appointment date
        // =================================================

        const [
            year,
            month,
            day
        ] = appointmentDate
            .split("-")
            .map(Number);


        const selectedDate =
            new Date(
                year,
                month - 1,
                day
            );


        // =================================================
        // 4. Validate actual calendar date
        // =================================================

        if (

            selectedDate.getFullYear() !== year ||

            selectedDate.getMonth() !==
                month - 1 ||

            selectedDate.getDate() !== day

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid appointment date"

            });

        }


        // =================================================
        // 5. Get today's date
        // =================================================

        const now =
            new Date();


        const today =
            new Date(

                now.getFullYear(),

                now.getMonth(),

                now.getDate()

            );


        // =================================================
        // 6. REJECT PAST DATE
        // =================================================

        if (
            selectedDate < today
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Appointment date cannot be in the past"

            });

        }


        // =================================================
        // 7. Validate time format
        // =================================================

        const timePattern =
            /^([01]\d|2[0-3]):([0-5]\d)$/;


        if (
            !timePattern.test(
                startTime
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid appointment time"

            });

        }


        // =================================================
        // 8. If appointment is TODAY,
        //    reject past time
        // =================================================

        const isToday =

            selectedDate.getFullYear() ===
                today.getFullYear() &&

            selectedDate.getMonth() ===
                today.getMonth() &&

            selectedDate.getDate() ===
                today.getDate();


        if (isToday) {

            const [
                slotHour,
                slotMinute
            ] = startTime
                .split(":")
                .map(Number);


            const slotMinutes =
                slotHour * 60 +
                slotMinute;


            const currentMinutes =
                now.getHours() * 60 +
                now.getMinutes();


            if (
                slotMinutes <=
                currentMinutes
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This appointment time has already passed"

                });

            }

        }


        // =================================================
        // 9. Find doctor
        // =================================================

        const doctor =
            await Doctor.findById(
                doctorId
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        // =================================================
        // 10. Check doctor availability
        // =================================================

        if (
            doctor.available === false
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor is currently unavailable"

            });

        }


        if (

            !doctor.availability ||

            doctor.availability.length === 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor has not configured availability"

            });

        }


        // =================================================
        // 11. Get selected day
        // =================================================

        const dayName =
            selectedDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        // =================================================
        // 12. Find doctor's availability
        // =================================================

        const dayAvailability =
            doctor.availability.find(

                item =>
                    item.day === dayName

            );


        if (!dayAvailability) {

            return res.status(400).json({

                success: false,

                message:
                    `Doctor is not available on ${dayName}`

            });

        }


        // =================================================
        // 13. Check sessions
        // =================================================

        if (

            !dayAvailability.sessions ||

            dayAvailability.sessions.length === 0

        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Doctor has no sessions on ${dayName}`

            });

        }


        // =================================================
        // 14. Calculate appointment end time
        // =================================================

        let [
            startHour,
            startMinute
        ] = startTime
            .split(":")
            .map(Number);


        const startTotalMinutes =
            startHour * 60 +
            startMinute;


        const endTotalMinutes =
            startTotalMinutes +
            doctor.slotDuration;


        const endHour =
            Math.floor(
                endTotalMinutes / 60
            );


        const endMinute =
            endTotalMinutes % 60;


        const endTime =
            `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;


        // =================================================
        // 15. Verify selected slot belongs to
        //     doctor's configured availability
        // =================================================

        let validSlot = false;


        for (
            const session
            of dayAvailability.sessions
        ) {

            if (

                !session.startTime ||

                !session.endTime

            ) {

                continue;

            }


            const [
                sessionStartHour,
                sessionStartMinute
            ] = session.startTime
                .split(":")
                .map(Number);


            const [
                sessionEndHour,
                sessionEndMinute
            ] = session.endTime
                .split(":")
                .map(Number);


            const sessionStartMinutes =
                sessionStartHour * 60 +
                sessionStartMinute;


            const sessionEndMinutes =
                sessionEndHour * 60 +
                sessionEndMinute;


            if (

                startTotalMinutes >=
                    sessionStartMinutes &&

                endTotalMinutes <=
                    sessionEndMinutes

            ) {

                // Check that the selected time
                // falls exactly on the slot interval

                const difference =
                    startTotalMinutes -
                    sessionStartMinutes;


                if (
                    difference %
                    doctor.slotDuration === 0
                ) {

                    validSlot = true;

                    break;

                }

            }

        }


        if (!validSlot) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected time slot is not available for this doctor"

            });

        }


        // =================================================
        // 16. Check whether slot is already booked
        // =================================================

        const startOfDay =
            new Date(

                year,

                month - 1,

                day,

                0,
                0,
                0,
                0

            );


        const endOfDay =
            new Date(

                year,

                month - 1,

                day,

                23,
                59,
                59,
                999

            );


        const existingAppointment =
            await Appointment.findOne({

                doctor: doctorId,

                appointmentDate: {

                    $gte: startOfDay,

                    $lte: endOfDay

                },

                startTime,

                status: {

                    $nin: [

                        "Rejected",

                        "Cancelled"

                    ]

                }

            });


        if (existingAppointment) {

            return res.status(400).json({

                success: false,

                message:
                    "This slot has already been booked."

            });

        }


        // =================================================
        // 17. Create appointment
        // =================================================

        const appointment =
            await Appointment.create({

                patient:
                    req.user.id,

                doctor:
                    doctorId,

                appointmentDate:
                    selectedDate,

                startTime,

                endTime,

                mode:
                    mode || "Offline",

                reason:
                    reason.trim()

            });


        // =================================================
        // 18. Success response
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Appointment Booked Successfully",

            appointment

        });

    }

    catch (error) {

        console.error(
            "Book Appointment Error:",
            error
        );


        // =================================================
        // Handle MongoDB duplicate booking
        // =================================================

        if (
            error.code === 11000
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This slot has already been booked."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};

// Get Logged-in Patient Appointments

const getMyAppointments = async (req, res) => {

    try {
        await updateExpiredAppointments();
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
        await updateExpiredAppointments();
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
             doctor: doctor._id,
             paymentStatus: "Paid"
        })
        .populate(
             "patient",
             "name email phone profileImage"
        )
        .populate(
             "doctor",
             "specialization consultationFee offlineConsultationFee onlineConsultationFee"
        )
        .sort({
             appointmentDate: -1
        });

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

// =====================================================
// Update Appointment Status
// =====================================================

const updateAppointmentStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        // =================================================
        // Allowed statuses that doctor can set
        // =================================================

        const allowedStatuses = [
            "Accepted",
            "Rejected",
            "Completed",
            "Patient No-Show",
            "Doctor No-Show"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Appointment Status"
            });
        }

        // =================================================
        // Find Doctor Profile
        // =================================================

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        // =================================================
        // Find Appointment
        // =================================================

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // =================================================
        // Check Ownership
        // =================================================

        if (
            appointment.doctor.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden"
            });
        }

        // =================================================
        // COMPLETION TIME VALIDATION
        // =================================================

        if (status === "Completed") {

            const appointmentDate =
                new Date(appointment.appointmentDate);

            const [hours, minutes] =
                appointment.startTime
                    .split(":")
                    .map(Number);

            appointmentDate.setHours(
                hours,
                minutes,
                0,
                0
            );

            const now = new Date();

            if (now < appointmentDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        `This appointment cannot be marked as completed before ${appointment.startTime}.`
                });
            }
        }

        // =================================================
        // Valid Status Transitions
        // =================================================

        const validTransitions = {
            Pending: [
                "Accepted",
                "Rejected"
            ],

            Accepted: [
                "Completed"
            ],

            Expired: [
                "Completed",
                "Patient No-Show",
                "Doctor No-Show"
            ],

            Rejected: [],
            Completed: [],
            Cancelled: [],
            "Patient No-Show": [],
            "Doctor No-Show": []
        };

        if (
            !validTransitions[appointment.status] ||
            !validTransitions[appointment.status].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change appointment from ${appointment.status} to ${status}`
            });
        }

        // =================================================
        // UPDATE STATUS
        // =================================================

        appointment.status = status;
        await appointment.save();

        // =================================================
        // REFUND
        // =================================================
        // Doctor rejection and Doctor No-Show both receive
        // a 100% refund.
        //
        // Patient No-Show receives no refund.
        // Completed receives no refund.
        // =================================================

        let refundMessage = "";

        if (
            status === "Rejected" ||
            status === "Doctor No-Show"
        ) {

            const refundedAppointment =
                await refundAppointmentPayment(
                    appointment._id
                );

            if (
                refundedAppointment.refundStatus ===
                "Processed"
            ) {
                refundMessage =
                    " Full refund processed successfully.";
            } else if (
                refundedAppointment.refundStatus ===
                "Pending"
            ) {
                refundMessage =
                    " Full refund has been initiated and is currently processing.";
            } else if (
                refundedAppointment.refundStatus ===
                "Failed"
            ) {
                refundMessage =
                    " The appointment is marked correctly, but the refund could not be processed yet.";
            }

            return res.status(200).json({
                success: true,
                message:
                    `Appointment ${status}.${refundMessage}`,
                appointment: refundedAppointment
            });
        }

        return res.status(200).json({
            success: true,
            message: `Appointment ${status}`,
            appointment
        });

    } catch (error) {

        console.error(
            "Update Appointment Status Error:",
            error
        );

        return res.status(500).json({
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
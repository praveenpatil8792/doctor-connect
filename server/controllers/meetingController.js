const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const MEETING_DOMAIN = process.env.JITSI_DOMAIN || "meet.jit.si";
const MEETING_TIMEZONE_OFFSET_MINUTES = Number(
    process.env.MEETING_TIMEZONE_OFFSET_MINUTES || 330
);

const getAppointmentWindow = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    const year = appointmentDate.getUTCFullYear();
    const month = appointmentDate.getUTCMonth();
    const day = appointmentDate.getUTCDate();

    const [startHour, startMinute] = appointment.startTime
        .split(":")
        .map(Number);

    const [endHour, endMinute] = appointment.endTime
        .split(":")
        .map(Number);

    const startLocalAsUtc = Date.UTC(
        year,
        month,
        day,
        startHour,
        startMinute,
        0,
        0
    );

    const endLocalAsUtc = Date.UTC(
        year,
        month,
        day,
        endHour,
        endMinute,
        0,
        0
    );

    const offsetMs = MEETING_TIMEZONE_OFFSET_MINUTES * 60 * 1000;

    return {
        start: new Date(startLocalAsUtc - offsetMs),
        end: new Date(endLocalAsUtc - offsetMs)
    };
};

const isParticipant = (appointment, req) => {
    if (req.user.role === "patient") {
        return appointment.patient?._id?.toString() === req.user.id;
    }

    if (req.user.role === "doctor") {
        return appointment.doctor?.user?._id?.toString() === req.user.id;
    }

    return false;
};

const getMeetingDetails = async (req, res) => {
    try {
        const appointment = await Appointment.findById(
            req.params.appointmentId
        )
            .populate("patient", "name email")
            .populate({
                path: "doctor",
                select: "user specialization",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (!isParticipant(appointment, req)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to join this appointment"
            });
        }

        if (appointment.mode !== "Online") {
            return res.status(400).json({
                success: false,
                message: "This appointment is not an online consultation"
            });
        }

        if (appointment.paymentStatus !== "Paid") {
            return res.status(400).json({
                success: false,
                message: "Payment must be completed before joining the consultation"
            });
        }

        if (appointment.status !== "Accepted") {
            return res.status(400).json({
                success: false,
                message: `The online meeting is available only for accepted appointments. Current status: ${appointment.status}`
            });
        }

        const window = getAppointmentWindow(appointment);
        const now = new Date();
        const joinFrom = new Date(window.start.getTime() - 10 * 60 * 1000);
        const joinUntil = new Date(window.end.getTime() + 15 * 60 * 1000);

        if (now < joinFrom || now > joinUntil) {
            return res.status(403).json({
                success: false,
                message: `The meeting is available from ${joinFrom.toLocaleString()} until ${joinUntil.toLocaleString()}`,
                meetingAvailableFrom: joinFrom,
                meetingAvailableUntil: joinUntil
            });
        }

        if (!appointment.meetingRoom) {
            appointment.meetingRoom =
                `doctor-connect-${appointment._id}-${crypto.randomBytes(6).toString("hex")}`;
        }

        if (appointment.meetingStatus === "Scheduled") {
            appointment.meetingStatus = "Started";
            appointment.meetingStartedAt =
                appointment.meetingStartedAt || new Date();
        }

        await appointment.save();

        const participantName =
            req.user.role === "doctor"
                ? appointment.doctor?.user?.name
                : appointment.patient?.name;

        return res.status(200).json({
            success: true,
            meeting: {
                domain: MEETING_DOMAIN,
                roomName: appointment.meetingRoom,
                participantName: participantName || "Participant",
                meetingStatus: appointment.meetingStatus,
                appointmentId: appointment._id,
                startTime: appointment.startTime,
                endTime: appointment.endTime
            }
        });
    } catch (error) {
        console.error("Get Meeting Details Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to open online meeting"
        });
    }
};

module.exports = {
    getMeetingDetails
};

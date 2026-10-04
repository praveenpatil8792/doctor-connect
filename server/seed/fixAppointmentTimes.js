const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const calculateEndTime = (startTime, slotDuration) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + Number(minutes) + Number(slotDuration || 30);

    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;

    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
};

const fixAppointmentTimes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const appointments = await Appointment.find({
            $expr: {
                $eq: ["$startTime", "$endTime"]
            }
        });

        let fixed = 0;

        for (const appointment of appointments) {
            const doctor = await Doctor.findById(appointment.doctor)
                .select("slotDuration");

            if (!doctor) {
                continue;
            }

            appointment.endTime = calculateEndTime(
                appointment.startTime,
                doctor.slotDuration
            );

            await appointment.save();
            fixed += 1;

            console.log(
                `${appointment.startTime} -> ${appointment.endTime} | ${appointment._id}`
            );
        }

        console.log(`Fixed ${fixed} appointment(s).`);

    } catch (error) {
        console.error("Fix appointment times error:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

fixAppointmentTimes();

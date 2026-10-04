const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        // The appointment slot index used to be globally unique.
        // Replace it with the new partial unique index so that
        // Cancelled/Rejected/Expired appointments do not block
        // the slot from being booked again.
        try {
            const indexes = await Appointment.collection.indexes();
            const oldIndex = indexes.find(
                (index) =>
                    index.name ===
                    "doctor_1_appointmentDate_1_startTime_1" &&
                    index.unique === true &&
                    !index.partialFilterExpression
            );

            if (oldIndex) {
                await Appointment.collection.dropIndex(
                    "doctor_1_appointmentDate_1_startTime_1"
                );
                console.log("Old appointment slot index removed");
            }

            await Appointment.createIndexes();
            console.log("Appointment slot index is ready");

        } catch (indexError) {
            console.error(
                "Appointment index setup failed:",
                indexError.message
            );
        }
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
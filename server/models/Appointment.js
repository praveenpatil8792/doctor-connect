const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(

    {

        patient: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        doctor: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Doctor",

            required: true

        },

        appointmentDate: {

            type: Date,

            required: true

        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
             type: String,
             required: true
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Offline"
        },

        reason: {

            type: String,

            required: true

        },

        status: {

            type: String,

            enum: [
                "Pending",
                "Accepted",
                "Rejected",
                "Completed"
            ],

            default: "Pending"

        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);
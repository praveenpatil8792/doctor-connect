const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    qualification: {
        type: String,
        required: true
    },

    experience: {
        type: Number,
        required: true
    },

    consultationFee: {
        type: Number,
        required: true
    },

    hospital: {
        type: String
    },

    about: {
        type: String
    },

    profilePhoto: {
        type: String,
        default: ""
    },

    available: {
        type: Boolean,
        default: true
    },

    availability: [
        {
            day: {
                type: String,
                enum: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ]
            },

            startTime: {
                type: String
            },

            endTime: {
                type: String
            }
        }
    ],

    slotDuration: {
        type: Number,
        default: 30
    },

    averageRating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

},
{
    timestamps: true
});

module.exports = mongoose.model("Doctor", doctorSchema);
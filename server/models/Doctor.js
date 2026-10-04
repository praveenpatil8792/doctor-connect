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

    location: {
        address: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        latitude: { type: Number, min: -90, max: 90, default: null },
        longitude: { type: Number, min: -180, max: 180, default: null }
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

            sessions: [
                {
                    startTime: {
                        type: String,
                        required: true
                    },

                    endTime: {
                        type: String,
                        required: true
                    }
                }
            ]
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
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Doctor", doctorSchema);
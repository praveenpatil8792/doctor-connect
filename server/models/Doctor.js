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
        default: ""
    },

    qualification: {
        type: String,
        default: ""
    },

    experience: {
        type: Number,
        default: 0,
        min: 0
    },

    consultationFee: {
        type: Number,
        required: true
    },

    // Legacy/general consultation fee kept for backward compatibility.
    // Offline/online booking now uses the two explicit fees below.
    offlineConsultationFee: {
        type: Number,
        default: 0,
        min: 0
    },

    onlineConsultationFee: {
        type: Number,
        default: 0,
        min: 0
    },

    offlineAppointmentsEnabled: {
        type: Boolean,
        default: true
    },

    onlineAppointmentsEnabled: {
        type: Boolean,
        default: true
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
        type: String,
        default: ""
    },

    nativeAddress: {
        type: String,
        default: ""
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
            ],

            // Slots explicitly removed by the doctor for this weekly schedule.
            excludedSlots: {
                type: [String],
                default: []
            },

            holiday: {
                type: Boolean,
                default: false
            }
        }
    ],

    // The Monday of the week for which the doctor last saved availability.
    // Patient booking is intentionally limited to this week only.
    availabilityWeekStart: {
        type: String,
        default: ""
    },

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
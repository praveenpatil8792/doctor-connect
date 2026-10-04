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
                "Completed",
                "Cancelled",
                "Expired",
                "Patient No-Show",
                "Doctor No-Show"
            ],

            default: "Pending"

        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunding in Progress",
                "Refunded"
            ],
            default: "Pending"
        },

        refundStatus: {
            type: String,
            enum: [
                "None",
                "Pending",
                "Processed",
                "Failed"
            ],
            default: "None"
        },

        refundId: {
            type: String,
            default: ""
        },

        refundAmount: {
            type: Number,
            default: 0
        },

        refundInitiatedAt: {
            type: Date,
            default: null
        },

        refundProcessedAt: {
            type: Date,
            default: null
        },

        refundFailureReason: {
            type: String,
            default: ""
        },

        paymentAmount: {
             type: Number,
             default: 0
        },

        razorpayOrderId: {
             type: String,
             default: ""
        },

        razorpayPaymentId: {
             type: String,
             default: ""
        }

    },

    {

        timestamps: true

    }

);

// ===========================
// Prevent Duplicate Booking
// ===========================

appointmentSchema.index(
    {
        doctor: 1,
        appointmentDate: 1,
        startTime: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);
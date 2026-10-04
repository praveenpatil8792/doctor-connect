const Razorpay = require("razorpay");
const Appointment = require("../models/Appointment");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Refund an appointment payment.
 *
 * Doctor Rejected  -> 100%
 * Doctor No-Show   -> 100%
 */
const refundAppointmentPayment = async (appointmentId) => {

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    // Do not create a second refund for the same appointment.
    if (appointment.refundStatus === "Processed") {
        return appointment;
    }

    if (appointment.refundStatus === "Pending") {
        return appointment;
    }

    if (appointment.refundStatus === "Failed") {
        // Allow a later retry.
        appointment.refundFailureReason = "";
    }

    if (!appointment.razorpayPaymentId) {
        appointment.refundStatus = "Failed";
        appointment.refundFailureReason =
            "Razorpay payment ID is missing";
        appointment.paymentStatus = "Paid";
        await appointment.save();
        return appointment;
    }

    const amountInPaise = Math.round(
        Number(appointment.paymentAmount) * 100
    );

    if (!amountInPaise || amountInPaise <= 0) {
        appointment.refundStatus = "Failed";
        appointment.refundFailureReason =
            "Invalid payment amount for refund";
        appointment.paymentStatus = "Paid";
        await appointment.save();
        return appointment;
    }

    try {

        const refund = await razorpay.payments.refund(
            appointment.razorpayPaymentId,
            {
                amount: amountInPaise
            }
        );

        appointment.refundId = refund.id || "";
        appointment.refundAmount = Number(
            refund.amount || amountInPaise
        ) / 100;
        appointment.refundInitiatedAt =
            appointment.refundInitiatedAt || new Date();
        appointment.refundFailureReason = "";

        if (refund.status === "processed") {
            appointment.refundStatus = "Processed";
            appointment.paymentStatus = "Refunded";
            appointment.refundProcessedAt = new Date();
        } else {
            // Razorpay may initially return pending.
            appointment.refundStatus = "Pending";
            appointment.paymentStatus = "Refunding in Progress";
            appointment.refundProcessedAt = null;
        }

        await appointment.save();

        return appointment;

    } catch (error) {

        console.error(
            "Razorpay refund error:",
            error
        );

        appointment.refundStatus = "Failed";
        appointment.paymentStatus = "Paid";
        appointment.refundFailureReason =
            error?.error?.description ||
            error?.message ||
            "Refund failed";

        await appointment.save();

        return appointment;
    }
};

module.exports = {
    refundAppointmentPayment
};

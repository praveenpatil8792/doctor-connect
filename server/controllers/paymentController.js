const Razorpay = require("razorpay");
const crypto = require("crypto");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

const createPaymentOrder = async (req, res) => {
    try {

        const {
            doctorId,
            appointmentDate,
            startTime,
            mode,
            reason
        } = req.body;


        // -------------------------------------------------
        // Validate input
        // -------------------------------------------------

        if (
            !doctorId ||
            !appointmentDate ||
            !startTime ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message: "Doctor, date, time and reason are required"
            });
        }


        // -------------------------------------------------
        // Find doctor
        // -------------------------------------------------

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }


        // -------------------------------------------------
        // Validate consultation fee
        // -------------------------------------------------

        const amount = Number(
            doctor.consultationFee
        );

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Doctor consultation fee is not configured"
            });
        }


        // -------------------------------------------------
        // IMPORTANT:
        // Check whether the slot is already booked
        //
        // Only real appointments are considered here.
        // Since we no longer create an appointment before
        // payment, failed payments will NOT block the slot.
        // -------------------------------------------------

        const existingAppointment =
            await Appointment.findOne({
                doctor: doctorId,
                appointmentDate: new Date(appointmentDate),
                startTime: startTime,
                status: {
                    $nin: [
                        "Cancelled",
                        "Rejected",
                        "Expired"
                    ]
                }
            });


        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }


        // -------------------------------------------------
        // Convert amount to paise
        // -------------------------------------------------

        const amountInPaise =
            Math.round(amount * 100);


        // -------------------------------------------------
        // Create Razorpay order
        // -------------------------------------------------

        const razorpayOrder =
            await razorpay.orders.create({

                amount: amountInPaise,

                currency: "INR",

                receipt:
                    `doctor_${doctorId}_${Date.now()}`,

                notes: {
                    doctorId:
                        doctorId.toString(),

                    appointmentDate:
                        appointmentDate,

                    startTime:
                        startTime,

                    patientId:
                        req.user.id
                }
            });


        // -------------------------------------------------
        // Return order details
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            orderId:
                razorpayOrder.id,

            amount:
                amountInPaise,

            currency:
                "INR",

            keyId:
                process.env.RAZORPAY_KEY_ID,

            doctorId,

            appointmentDate,

            startTime,

            mode:
                mode || "Offline",

            reason
        });


    } catch (error) {

        console.error(
            "Create Razorpay Order Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create payment order"
        });

    }
};



// =====================================================
// VERIFY PAYMENT + CREATE APPOINTMENT
// =====================================================

const verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,

            doctorId,
            appointmentDate,
            startTime,
            mode,
            reason
        } = req.body;


        // -------------------------------------------------
        // Validate data
        // -------------------------------------------------

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !doctorId ||
            !appointmentDate ||
            !startTime ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification data is incomplete"

            });

        }


        // -------------------------------------------------
        // Verify Razorpay signature
        // -------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        const expected =
            Buffer.from(
                generatedSignature,
                "utf8"
            );

        const received =
            Buffer.from(
                razorpay_signature,
                "utf8"
            );


        const isValid =
            expected.length === received.length &&
            crypto.timingSafeEqual(
                expected,
                received
            );


        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed"

            });

        }


        // -------------------------------------------------
        // Find doctor
        // -------------------------------------------------

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


        // -------------------------------------------------
        // IMPORTANT:
        // Check slot again AFTER payment.
        //
        // This protects against another patient booking
        // the same slot while this patient was paying.
        // -------------------------------------------------

        const existingAppointment =
            await Appointment.findOne({

                doctor: doctorId,

                appointmentDate:
                    new Date(appointmentDate),

                startTime:

                    startTime,

                status: {

                    $nin: [
                        "Cancelled",
                        "Rejected",
                        "Expired"
                    ]

                }

            });


        if (existingAppointment) {

            // Payment succeeded but slot is no longer
            // available.
            //
            // Later we should automatically refund this
            // payment through Razorpay.

            return res.status(409).json({

                success: false,

                paymentSuccessful: true,

                message:
                    "Payment was successful, but this appointment slot is no longer available. Please contact support for a refund."

            });

        }


        // -------------------------------------------------
        // Create appointment ONLY AFTER PAYMENT
        // -------------------------------------------------

        const appointment =
            await Appointment.create({

                patient:
                    req.user.id,

                doctor:
                    doctorId,

                appointmentDate:
                    new Date(appointmentDate),

                startTime:
                    startTime,

                endTime:
                    startTime,

                mode:
                    mode || "Offline",

                reason:
                    reason,

                status:
                    "Pending",

                paymentStatus:
                    "Paid",

                paymentAmount:
                    doctor.consultationFee,

                razorpayOrderId:
                    razorpay_order_id,

                razorpayPaymentId:
                    razorpay_payment_id

            });


        // -------------------------------------------------
        // Success
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Payment successful and appointment booked",

            appointment

        });


    } catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );


        // -------------------------------------------------
        // Duplicate slot protection
        // -------------------------------------------------

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This appointment slot has already been booked"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify payment"

        });

    }

};


module.exports = {

    createPaymentOrder,

    verifyPayment

};
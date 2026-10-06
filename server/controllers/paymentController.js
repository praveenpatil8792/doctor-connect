const Razorpay = require("razorpay");
const crypto = require("crypto");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { refundAppointmentPayment } = require("../services/refundService");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const calculateEndTime = (startTime, slotDuration) => {

    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + Number(slotDuration || 30);

    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;

    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
};
const getAppointmentModeConfig = (doctor, mode) => {

    const selectedMode = mode === "Online" ? "Online" : "Offline";

    const enabled = selectedMode === "Online"
        ? doctor.onlineAppointmentsEnabled !== false
        : doctor.offlineAppointmentsEnabled !== false;

    const configuredFee = selectedMode === "Online"
        ? doctor.onlineConsultationFee
        : doctor.offlineConsultationFee;

    const legacyFee = Number(doctor.consultationFee || 0);
    const fee = Number(configuredFee || legacyFee);

    return { selectedMode, enabled, fee };
};



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

        const selectedMode = mode === "Online" ? "Online" : "Offline";


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
        // Validate appointment mode and select its fee
        // -------------------------------------------------

        const modeConfig = getAppointmentModeConfig(
            doctor,
            selectedMode
        );

        if (!modeConfig.enabled) {
            return res.status(400).json({
                success: false,
                message: `${selectedMode} appointments are currently disabled by this doctor`
            });
        }

        const amount = modeConfig.fee;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: `${selectedMode} consultation fee is not configured`
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


        const endTime = calculateEndTime(
            startTime,
            doctor.slotDuration
        );


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

                    endTime:
                        endTime,

                    patientId:
                        req.user.id
                }
            });

           console.log("========== RAZORPAY TEST ==========");
           console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
           console.log("Order ID:", razorpayOrder.id);
console.log("Amount:", razorpayOrder.amount);
console.log("Currency:", razorpayOrder.currency);
console.log("Status:", razorpayOrder.status);
console.log("==================================");
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

            endTime,

            mode:
                selectedMode,

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


        // Resolve the appointment mode and fee again during verification.
        // These variables are intentionally calculated here because the
        // Razorpay payment is verified in a separate request from
        // createPaymentOrder.
        const modeConfig = getAppointmentModeConfig(
            doctor,
            mode
        );

        if (!modeConfig.enabled) {
            return res.status(400).json({
                success: false,
                message: `${modeConfig.selectedMode} appointments are currently disabled by this doctor`
            });
        }

        if (!modeConfig.fee || modeConfig.fee <= 0) {
            return res.status(400).json({
                success: false,
                message: `${modeConfig.selectedMode} consultation fee is not configured`
            });
        }

        const selectedMode = modeConfig.selectedMode;


        const endTime = calculateEndTime(
            startTime,
            doctor.slotDuration
        );


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

            // Payment succeeded but the slot was taken while
            // this patient was completing Razorpay checkout.
            // Automatically issue a full refund.
            try {
                const temporaryAppointment = await Appointment.create({
                    patient: req.user.id,
                    doctor: doctorId,
                    appointmentDate: new Date(appointmentDate),
                    startTime,
                    endTime,
                    mode: selectedMode,
                    reason,
                    status: "Cancelled",
                    paymentStatus: "Paid",
                    paymentAmount: modeConfig.fee,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    cancelledBy: "system"
                });

                await refundAppointmentPayment(
                    temporaryAppointment,
                    100,
                    "Slot became unavailable after successful payment"
                );
            } catch (refundError) {
                console.error(
                    "Automatic refund after slot conflict failed:",
                    refundError
                );
            }

            return res.status(409).json({
                success: false,
                paymentSuccessful: true,
                refundInitiated: true,
                message:
                    "Payment was successful, but this appointment slot was no longer available. A full refund has been initiated."
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
                    endTime,

                mode:
                    selectedMode,

                reason:
                    reason,

                status:
                    "Pending",

                paymentStatus:
                    "Paid",

                paymentAmount:
                    modeConfig.fee,

                razorpayOrderId:
                    razorpay_order_id,

                razorpayPaymentId:
                    razorpay_payment_id,

                meetingStatus:
                    selectedMode === "Online"
                        ? "Scheduled"
                        : "Not Required"

            });


        if (selectedMode === "Online") {
            appointment.meetingRoom =
                `doctor-connect-${appointment._id}-${crypto.randomBytes(6).toString("hex")}`;

            await appointment.save();
        }


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

            // Razorpay payment already succeeded, but MongoDB
            // rejected the appointment because another active
            // appointment won the slot race. Refund the payment.
            try {
                const doctor = await Doctor.findById(
                    req.body.doctorId
                );

                const duplicateModeConfig = getAppointmentModeConfig(
                    doctor,
                    req.body.mode
                );

                const endTime = calculateEndTime(
                    req.body.startTime,
                    doctor?.slotDuration || 30
                );

                const temporaryAppointment = await Appointment.create({
                    patient: req.user.id,
                    doctor: req.body.doctorId,
                    appointmentDate: new Date(req.body.appointmentDate),
                    startTime: req.body.startTime,
                    endTime,
                    mode: duplicateModeConfig.selectedMode,
                    reason: req.body.reason,
                    status: "Cancelled",
                    paymentStatus: "Paid",
                    paymentAmount: duplicateModeConfig.fee || 0,
                    razorpayOrderId: req.body.razorpay_order_id,
                    razorpayPaymentId: req.body.razorpay_payment_id,
                    cancelledBy: "system"
                });

                await refundAppointmentPayment(
                    temporaryAppointment,
                    100,
                    "Slot became unavailable after successful payment"
                );
            } catch (refundError) {
                console.error(
                    "Automatic refund after duplicate booking failed:",
                    refundError
                );
            }

            return res.status(409).json({
                success: false,
                paymentSuccessful: true,
                refundInitiated: true,
                message:
                    "Payment was successful, but the slot was already booked. A full refund has been initiated."
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
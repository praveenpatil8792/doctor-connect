import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { bookAppointment } from "../services/appointmentService";
import { getDoctorSlots } from "../services/doctorService";
import { useNavigate } from "react-router-dom";
import {
    createPaymentOrder,
    verifyPayment
} from "../services/paymentService";


// =====================================================
// GET TODAY'S DATE IN LOCAL TIME
// Returns YYYY-MM-DD
// =====================================================

const getLocalToday = () => {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =====================================================
// Load Razorpay Checkout Script
// =====================================================

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => {
            resolve(true);
        };

        script.onerror = () => {
            resolve(false);
        };

        document.body.appendChild(script);
    });
};



export default function BookAppointment() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [date, setDate] = useState("");

    const [slots, setSlots] = useState([]);

    const [selectedSlot, setSelectedSlot] = useState("");

    const [reason, setReason] = useState("");

    const [loadingSlots, setLoadingSlots] = useState(false);

    const [booking, setBooking] = useState(false);

    const [paymentFailed, setPaymentFailed] = useState(false);

    const [paymentError, setPaymentError] = useState("");

    const [paymentConflict, setPaymentConflict] = useState(false);

    const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);

    const [pendingAppointmentId, setPendingAppointmentId] = useState(null);


    // =====================================================
    // TODAY
    // =====================================================

    const today = getLocalToday();


    // =====================================================
    // GET AVAILABLE SLOTS WHEN DATE CHANGES
    // =====================================================

    useEffect(() => {

        if (!date) {

            setSlots([]);

            setSelectedSlot("");

            return;
        }


        // -------------------------------------------------
        // Extra frontend protection against past dates
        // -------------------------------------------------

        if (date < today) {

            setSlots([]);

            setSelectedSlot("");

            return;
        }


        loadSlots();

    }, [date]);


    // =====================================================
    // LOAD AVAILABLE SLOTS
    // =====================================================

    const loadSlots = async () => {

        try {

            setLoadingSlots(true);

            setSelectedSlot("");


            const data = await getDoctorSlots(
                id,
                date
            );


            console.log(
                "Available slots:",
                data.slots
            );


            setSlots(
                data.slots || []
            );

        }

        catch (error) {

            console.error(
                "Error loading slots:",
                error
            );

            setSlots([]);

        }

        finally {

            setLoadingSlots(false);

        }

    };


    // =====================================================
    // HANDLE DATE CHANGE
    // =====================================================

    const handleDateChange = (e) => {

        const selectedDate = e.target.value;


        // -------------------------------------------------
        // Do not allow past dates
        // -------------------------------------------------

        if (selectedDate < today) {

            alert(
                "You cannot select a date in the past."
            );

            setDate("");

            setSlots([]);

            setSelectedSlot("");

            return;
        }


        setDate(selectedDate);

    };


   // =====================================================
// HANDLE BOOKING + PAYMENT
// =====================================================

const handleSubmit = async (e) => {

    e.preventDefault();


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!date) {

        alert(
            "Please select an appointment date"
        );

        return;
    }


    if (!selectedSlot) {

        alert(
            "Please select an appointment slot"
        );

        return;
    }


    if (!reason.trim()) {

        alert(
            "Please enter the reason for the appointment"
        );

        return;
    }


    try {

        setBooking(true);

        setPaymentFailed(false);

        setPaymentError("");


        // -------------------------------------------------
        // STEP 1:
        // Create Razorpay order
        //
        // IMPORTANT:
        // Appointment is NOT created here.
        // -------------------------------------------------

        const order =
            await createPaymentOrder({

                doctorId:
                    id,

                appointmentDate:
                    date,

                startTime:
                    selectedSlot,

                mode:
                    "Offline",

                reason:
                    reason.trim()

            });


        // -------------------------------------------------
        // STEP 2:
        // Load Razorpay
        // -------------------------------------------------

        const razorpayLoaded =
            await loadRazorpayScript();


        if (!razorpayLoaded) {

            throw new Error(
                "Razorpay failed to load. Please check your internet connection."
            );

        }


        // -------------------------------------------------
        // STEP 3:
        // Razorpay options
        // -------------------------------------------------


         const options = {

             key:
                 order.keyId,

             amount:
                 order.amount,

             currency:
                 order.currency,

             name:
                 "Doctor Connect",

             description:
                 "Doctor Consultation",

             order_id:
                 order.orderId,


             // -------------------------------------------------
             // PAYMENT SUCCESS
             // -------------------------------------------------

             handler:
                 async function (response) {

                     try {

                         const verification =
                             await verifyPayment({

                                 razorpay_order_id:
                                     response.razorpay_order_id,

                                 razorpay_payment_id:
                                     response.razorpay_payment_id,

                                 razorpay_signature:
                                     response.razorpay_signature,

                                 doctorId:
                                     id,

                                 appointmentDate:
                                     date,

                                 startTime:
                                     selectedSlot,

                                 mode:
                                     "Offline",

                                 reason:
                                     reason.trim()

                             });


                         if (!verification.success) {

                             throw new Error(
                                 verification.message ||
                                 "Payment verification failed"
                             );

                         }


                         // -------------------------------------------------
                         // PAYMENT + APPOINTMENT SUCCESS
                         // -------------------------------------------------

                         setBooking(false);

                         setAppointmentConfirmed(true);


                         // -------------------------------------------------
                         // Redirect after 3 seconds
                         // -------------------------------------------------

                         setTimeout(() => {

                            navigate(
                                 "/my-appointments",
                                {
                                     replace: true
                                }
                            );

                        }, 3000);


                     }

                     catch (error) {

                        console.error(
                             "Payment verification error:",
                             error
                         );


                         setBooking(false);

                         const responseData =
                             error.response?.data;

                         setPaymentConflict(
                             responseData?.paymentSuccessful === true
                         );

                         setPaymentFailed(true);


                         setPaymentError(

                             responseData?.message ||

                             error.message ||

                             "Payment verification failed"

                         );

                     }

                 },


             // -------------------------------------------------
             // PAYMENT FAILED
             // -------------------------------------------------

             "payment.failed":
                 function (response) {

                     console.error(
                         "Razorpay payment failed:",
                         response
                     );


                     setBooking(false);

                     setPaymentFailed(true);


                     setPaymentError(

                         response.error
                             ?.description ||

                         "Payment failed. Please try again."

                     );

                 },


             // -------------------------------------------------
             // PREFILL
             // -------------------------------------------------

             prefill: {

                 name:
                     "",

                 email:
                     "",

                 contact:
                     ""

             },


             // -------------------------------------------------
             // THEME
             // -------------------------------------------------

             theme: {

                 color:
                     "#2563eb"

             },


             // -------------------------------------------------
             // USER CLOSES RAZORPAY
             // -------------------------------------------------

             modal: {

                 ondismiss:
                     function () {

                         console.log(
                             "Razorpay checkout cancelled"
                         );


                         setBooking(false);

                         setPaymentFailed(true);


                         setPaymentError(
                             "Payment was cancelled. No appointment was booked."
                         );

                     }

             }

        };


        // -------------------------------------------------
        // OPEN RAZORPAY
        // -------------------------------------------------

        const razorpay =
            new window.Razorpay(
                options
            );


        razorpay.open();


    }

    catch (error) {

        console.error(
            "Payment error:",
            error
        );


        setBooking(false);

        setPaymentFailed(true);


        setPaymentError(

            error.response
                ?.data
                ?.message ||

            error.message ||

            "Unable to process payment"

        );

    }

};




if (appointmentConfirmed) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

                <div className="mx-auto mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                    <span className="text-4xl text-green-600">
                        ✓
                    </span>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Appointment Confirmed
                </h2>

                <p className="text-gray-600 mb-2">
                    Your payment was successful.
                </p>

                <p className="text-gray-600 mb-6">
                    Your appointment has been successfully booked.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                    Redirecting to your appointments...
                </div>

            </div>
        </div>
    );
}




if (paymentFailed) {

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">


                {/* ERROR ICON */}

                <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-red-100">

                    <span className={`text-3xl ${
                        paymentConflict
                            ? "text-yellow-600"
                            : "text-red-600"
                    }`}>
                        {paymentConflict ? "!" : "✕"}
                    </span>

                </div>


                {/* TITLE */}

                <h2 className="text-2xl font-bold text-gray-800 mb-2">

                    {paymentConflict
                        ? "Payment Successful - Slot Unavailable"
                        : "Payment Failed"}

                </h2>


                {/* ERROR */}

                <p className="text-gray-600 mb-4">

                    {paymentError ||
                        "Your payment was not completed."}

                </p>


                {/* IMPORTANT MESSAGE */}

                <p className="text-sm text-gray-500 mb-6">

                    {paymentConflict
                        ? "Your payment succeeded, but the slot was no longer available. A full refund has been initiated automatically. Please select another slot."
                        : "No appointment was booked. Please select the slot again and try the payment again."}

                </p>


                {/* BACK BUTTON */}

                <button

                    onClick={() => {

                        setPaymentFailed(false);

                        setPaymentConflict(false);

                        setPaymentError("");

                        setSelectedSlot("");

                        loadSlots();

                    }}

                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"

                >

                    Back to Appointment

                </button>


            </div>

        </div>

    );

}





    return (

        <MainLayout>

            <div className="max-w-3xl mx-auto py-12">

                <h1 className="text-4xl font-bold mb-8">

                    Book Appointment

                </h1>


                <form

                    onSubmit={handleSubmit}

                    className="space-y-8"

                >


                    {/* =================================
                        DATE
                    ================================= */}

                    <div>

                        <label className="block font-semibold mb-2">

                            Select Date

                        </label>


                        <input

                            type="date"

                            value={date}

                            min={today}

                            onChange={handleDateChange}

                            className="border rounded-lg p-3 w-full"

                            required

                        />

                    </div>



                    {/* =================================
                        TIME SLOTS
                    ================================= */}

                    <div>

                        <h2 className="font-semibold mb-4">

                            Select Time Slot

                        </h2>


                        {/* Loading */}

                        {loadingSlots && (

                            <p className="text-gray-500">

                                Loading available slots...

                            </p>

                        )}



                        {/* No date */}

                        {!loadingSlots &&
                            !date && (

                                <p className="text-gray-500">

                                    Please select a date to see
                                    available time slots.

                                </p>

                            )}



                        {/* Past date */}

                        {!loadingSlots &&
                            date &&
                            date < today && (

                                <div className="border rounded-lg p-5 bg-gray-50">

                                    <p className="text-gray-600">

                                        Past dates are not available
                                        for appointments.

                                    </p>

                                </div>

                            )}



                        {/* No slots */}

                        {!loadingSlots &&
                            date &&
                            date >= today &&
                            slots.length === 0 && (

                                <div className="border rounded-lg p-5 bg-gray-50">

                                    <p className="text-gray-600">

                                        No available slots for this date.

                                    </p>

                                </div>

                            )}



                        {/* Slots */}

                        {!loadingSlots &&
                            date &&
                            date >= today &&
                            slots.length > 0 && (

                                <div className="grid grid-cols-4 gap-3">

                                    {slots.map(
                                        (slot) => (

                                            <button

                                                key={slot}

                                                type="button"

                                                onClick={() =>
                                                    setSelectedSlot(
                                                        slot
                                                    )
                                                }

                                                className={`

                                                    p-3

                                                    rounded-lg

                                                    border

                                                    transition

                                                    ${

                                                        selectedSlot ===
                                                        slot

                                                            ? "bg-blue-600 text-white border-blue-600"

                                                            : "hover:bg-blue-50"

                                                    }

                                                `}

                                            >

                                                {slot}

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                    </div>



                    {/* =================================
                        SELECTED SLOT
                    ================================= */}

                    {selectedSlot && (

                        <div className="p-4 bg-blue-50 rounded-lg">

                            <p className="font-semibold">

                                Selected Time:

                            </p>


                            <p className="text-blue-600 text-lg">

                                {selectedSlot}

                            </p>

                        </div>

                    )}



                    {/* =================================
                        REASON
                    ================================= */}

                    <div>

                        <label className="block font-semibold mb-2">

                            Reason for Appointment

                        </label>


                        <textarea

                            rows={5}

                            placeholder="Reason"

                            value={reason}

                            onChange={(e) =>
                                setReason(
                                    e.target.value
                                )
                            }

                            className="border rounded-lg p-3 w-full"

                            required

                        />

                    </div>



                    {/* =================================
                        BOOK BUTTON
                    ================================= */}

                    <button

                        type="submit"

                        disabled={
                            booking ||
                            !selectedSlot ||
                            !date ||
                            date < today
                        }

                        className={`

                            px-8

                            py-3

                            rounded-lg

                            text-white

                            ${

                                booking ||
                                !selectedSlot ||
                                !date ||
                                date < today

                                    ? "bg-gray-400 cursor-not-allowed"

                                    : "bg-blue-600 hover:bg-blue-700"

                            }

                        `}

                    >

                        {booking

                            ? "Processing Payment..."

                            : "Book Appointment & Pay"

                        }

                    </button>

                </form>

            </div>

        </MainLayout>

    );

}
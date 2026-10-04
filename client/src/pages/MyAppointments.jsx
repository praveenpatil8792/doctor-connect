import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import {
    getMyAppointments,
    cancelAppointment,
} from "../services/appointmentService";

import {
    getMyReviews,
} from "../services/reviewService";

import LocationAccessModal from "../components/common/LocationAccessModal";

import {
    getStoredLocation,
    getDirectionsUrl,
    getHospitalMapUrl,
} from "../utils/location";


export default function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [activeTab, setActiveTab] = useState("active");

    const [showLocationModal, setShowLocationModal] =
        useState(false);

    const [selectedHospital, setSelectedHospital] =
        useState(null);


    // =========================================
    // FETCH APPOINTMENTS
    // =========================================

    useEffect(() => {

        fetchAppointments();
        fetchReviews();

    }, []);


    const fetchAppointments = async () => {

        try {

            const data = await getMyAppointments();

            setAppointments(
                data.appointments || []
            );

        } catch (err) {

            console.log(
                "Appointments loading error:",
                err
            );

        }

    };


    // =========================================
    // FETCH REVIEWS
    // =========================================

    const fetchReviews = async () => {

        try {

            const data = await getMyReviews();

            setReviews(
                data.reviews || []
            );

        } catch (err) {

            console.log(
                "Reviews loading error:",
                err
            );

        }

    };


    // =========================================
    // CANCEL APPOINTMENT
    // =========================================

    const handleCancel = async (id) => {

        try {

            await cancelAppointment(id);

            await fetchAppointments();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to cancel appointment"
            );

        }

    };


    // =========================================
    // OPEN HOSPITAL MAP / DIRECTIONS
    // =========================================

    const handleViewMap = (appointment) => {

        const location =
            appointment.doctor?.location;

        const latitude =
            Number(location?.latitude);

        const longitude =
            Number(location?.longitude);


        // Doctor does not have valid coordinates
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            alert(
                "Hospital location is not available for this doctor."
            );

            return;

        }


        const storedLocation =
            getStoredLocation();


        // =====================================
        // USER LOCATION ALREADY AVAILABLE
        // =====================================

        if (storedLocation) {

            window.open(
                getDirectionsUrl(
                    latitude,
                    longitude,
                    storedLocation.latitude,
                    storedLocation.longitude
                ),
                "_blank",
                "noopener,noreferrer"
            );

            return;

        }


        // =====================================
        // ASK FOR USER LOCATION
        // =====================================

        setSelectedHospital({
            latitude,
            longitude,
        });

        setShowLocationModal(true);

    };


    // =========================================
    // LOCATION ACCESS SUCCESS
    // =========================================

    const handleLocationSuccess = (location) => {

        if (!selectedHospital) {

            setShowLocationModal(false);

            return;

        }


        window.open(
            getDirectionsUrl(
                selectedHospital.latitude,
                selectedHospital.longitude,
                location.latitude,
                location.longitude
            ),
            "_blank",
            "noopener,noreferrer"
        );


        setShowLocationModal(false);
        setSelectedHospital(null);

    };


    // =========================================
    // LOCATION ACCESS DENIED
    // =========================================

    const handleLocationDenied = () => {

        if (!selectedHospital) {

            setShowLocationModal(false);

            return;

        }


        // If user does not allow location,
        // show only the hospital location.

        window.open(
            getHospitalMapUrl(
                selectedHospital.latitude,
                selectedHospital.longitude
            ),
            "_blank",
            "noopener,noreferrer"
        );


        setShowLocationModal(false);
        setSelectedHospital(null);

    };


    // =========================================
    // STATUS COLORS
    // =========================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Accepted":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Completed":
                return "bg-blue-100 text-blue-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            case "Cancelled":
                return "bg-gray-100 text-gray-700";

            case "Expired":
                return "bg-orange-100 text-orange-700";

            case "Patient No-Show":
            case "Doctor No-Show":
                return "bg-purple-100 text-purple-700";

            default:
                return "bg-gray-100 text-gray-700";

        }

    };


    // =========================================
    // PAYMENT STATUS COLORS
    // =========================================

    const getPaymentStatusClass = (status) => {

        switch (status) {

            case "Paid":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Failed":
                return "bg-red-100 text-red-700";

            case "Refunding in Progress":
                return "bg-orange-100 text-orange-700";

            case "Refunded":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";

        }

    };


    // =========================================
    // DIVIDE APPOINTMENTS
    // =========================================

    const activeAppointments =
        appointments.filter(
            (appointment) =>
                appointment.status === "Pending" ||
                appointment.status === "Accepted"
        );


    const inactiveAppointments =
        appointments.filter(
            (appointment) =>
                appointment.status === "Cancelled" ||
                appointment.status === "Rejected" ||
                appointment.status === "Expired" ||
                appointment.status === "Patient No-Show" ||
                appointment.status === "Doctor No-Show"
        );


    const completedAppointments =
        appointments.filter(
            (appointment) =>
                appointment.status === "Completed"
        );


    // =========================================
    // SELECT CURRENT SECTION
    // =========================================

    let displayedAppointments = [];

    if (activeTab === "active") {

        displayedAppointments =
            activeAppointments;

    } else if (activeTab === "inactive") {

        displayedAppointments =
            inactiveAppointments;

    } else if (activeTab === "completed") {

        displayedAppointments =
            completedAppointments;

    }


    // =========================================
    // EMPTY MESSAGE
    // =========================================

    const getEmptyMessage = () => {

        if (activeTab === "active") {

            return "You don't have any active appointments.";

        }

        if (activeTab === "inactive") {

            return "You don't have any inactive appointments.";

        }

        return "You don't have any completed appointments.";

    };


    return (

        <MainLayout>

            <div className="max-w-6xl mx-auto py-10 px-4">

                {/* =====================================
                    PAGE TITLE
                ===================================== */}

                <h1 className="text-3xl font-bold mb-8">
                    My Appointments
                </h1>


                {/* =====================================
                    TABS
                ===================================== */}

                <div className="mb-8 bg-white border rounded-xl shadow-sm p-2">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                        {/* ACTIVE */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("active")
                            }
                            className={`px-5 py-3 rounded-lg font-semibold transition ${
                                activeTab === "active"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Active
                            <span className="ml-2">
                                ({activeAppointments.length})
                            </span>
                        </button>


                        {/* INACTIVE */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("inactive")
                            }
                            className={`px-5 py-3 rounded-lg font-semibold transition ${
                                activeTab === "inactive"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Inactive
                            <span className="ml-2">
                                ({inactiveAppointments.length})
                            </span>
                        </button>


                        {/* COMPLETED */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("completed")
                            }
                            className={`px-5 py-3 rounded-lg font-semibold transition ${
                                activeTab === "completed"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Completed
                            <span className="ml-2">
                                ({completedAppointments.length})
                            </span>
                        </button>

                    </div>

                </div>


                {/* =====================================
                    APPOINTMENT LIST
                ===================================== */}

                {displayedAppointments.length === 0 ? (

                    <div className="bg-white border rounded-xl p-8 text-center shadow">

                        <p className="text-gray-500">
                            {getEmptyMessage()}
                        </p>

                    </div>

                ) : (

                    <div className="space-y-6">

                        {displayedAppointments.map(
                            (appointment) => {

                                const existingReview =
                                    reviews.find(
                                        (review) =>
                                            review.appointment?._id ===
                                                appointment._id ||
                                            review.appointment ===
                                                appointment._id
                                    );


                                const isActive =
                                    appointment.status ===
                                        "Pending" ||
                                    appointment.status ===
                                        "Accepted";


                                const isCompleted =
                                    appointment.status ===
                                    "Completed";


                                const hasHospitalLocation =
                                    Number.isFinite(
                                        Number(
                                            appointment.doctor?.location
                                                ?.latitude
                                        )
                                    ) &&
                                    Number.isFinite(
                                        Number(
                                            appointment.doctor?.location
                                                ?.longitude
                                        )
                                    );


                                return (

                                    <div
                                        key={
                                            appointment._id
                                        }
                                        className="bg-white border rounded-xl p-6 shadow"
                                    >

                                        {/* =================================
                                            DOCTOR INFORMATION
                                        ================================= */}

                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                                            <div>

                                                <h2 className="text-xl font-semibold">

                                                    Dr.{" "}

                                                    {
                                                        appointment
                                                            .doctor
                                                            ?.user
                                                            ?.name
                                                    }

                                                </h2>


                                                <p className="text-gray-600">

                                                    {
                                                        appointment
                                                            .doctor
                                                            ?.specialization
                                                    }

                                                </p>


                                                {appointment.doctor?.hospital && (

                                                    <p className="text-sm text-gray-500 mt-1">

                                                        🏥{" "}

                                                        {
                                                            appointment
                                                                .doctor
                                                                .hospital
                                                        }

                                                    </p>

                                                )}

                                            </div>


                                            {/* STATUS */}

                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                                                    appointment.status
                                                )}`}
                                            >

                                                {
                                                    appointment.status
                                                }

                                            </span>

                                        </div>


                                        {/* =================================
                                            APPOINTMENT INFORMATION
                                        ================================= */}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                                            {/* DATE */}

                                            <div className="bg-gray-50 rounded-lg p-4">

                                                <p className="text-sm text-gray-500">
                                                    Appointment Date
                                                </p>

                                                <p className="font-semibold mt-1">

                                                    {new Date(
                                                        appointment.appointmentDate
                                                    ).toLocaleDateString()}

                                                </p>

                                            </div>


                                            {/* TIME */}

                                            <div className="bg-gray-50 rounded-lg p-4">

                                                <p className="text-sm text-gray-500">
                                                    Appointment Time
                                                </p>

                                                <p className="font-semibold mt-1">

                                                    {
                                                        appointment.startTime
                                                    }

                                                    {" - "}

                                                    {
                                                        appointment.endTime
                                                    }

                                                </p>

                                            </div>


                                            {/* MODE */}

                                            <div className="bg-gray-50 rounded-lg p-4">

                                                <p className="text-sm text-gray-500">
                                                    Consultation Mode
                                                </p>

                                                <p className="font-semibold mt-1">

                                                    {
                                                        appointment.mode ||
                                                        "Offline"
                                                    }

                                                </p>

                                            </div>


                                            {/* REASON */}

                                            <div className="bg-gray-50 rounded-lg p-4">

                                                <p className="text-sm text-gray-500">
                                                    Reason
                                                </p>

                                                <p className="font-semibold mt-1">

                                                    {
                                                        appointment.reason
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* =================================
                                            LOCATION
                                            ONLY ACTIVE APPOINTMENTS
                                        ================================= */}

                                        {isActive &&
                                            appointment.doctor
                                                ?.location && (

                                            <div className="mt-6 border-t pt-5">

                                                <h3 className="text-lg font-semibold mb-4">
                                                    Hospital Location
                                                </h3>


                                                <div className="bg-gray-50 rounded-lg p-5">

                                                    {appointment.doctor.location.address && (

                                                        <p className="text-gray-700">

                                                            📍{" "}

                                                            {
                                                                appointment
                                                                    .doctor
                                                                    .location
                                                                    .address
                                                            }

                                                        </p>

                                                    )}


                                                    <p className="text-gray-600 mt-1">

                                                        {
                                                            appointment
                                                                .doctor
                                                                .location
                                                                .city
                                                        }

                                                        {appointment.doctor.location.city &&
                                                            appointment.doctor.location.state &&
                                                            ", "}

                                                        {
                                                            appointment
                                                                .doctor
                                                                .location
                                                                .state
                                                        }

                                                        {appointment.doctor.location.pincode &&
                                                            ` - ${appointment.doctor.location.pincode}`}

                                                    </p>


                                                    {hasHospitalLocation && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewMap(
                                                                    appointment
                                                                )
                                                            }
                                                            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                                        >
                                                            🗺️ View in Map
                                                        </button>

                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================
                                            PAYMENT INFORMATION
                                        ================================= */}

                                        <div className="mt-6 border-t pt-5">

                                            <h3 className="text-lg font-semibold mb-4">
                                                Payment Details
                                            </h3>


                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                {/* PAYMENT STATUS */}

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Payment Status
                                                    </p>

                                                    <span
                                                        className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusClass(
                                                            appointment.paymentStatus
                                                        )}`}
                                                    >

                                                        {
                                                            appointment.paymentStatus ||
                                                            "Pending"
                                                        }

                                                    </span>

                                                </div>


                                                {/* AMOUNT */}

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Amount Paid
                                                    </p>

                                                    <p className="font-semibold mt-1">

                                                        ₹
                                                        {
                                                            Number(
                                                                appointment.paymentAmount ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }

                                                    </p>

                                                </div>


                                                {/* PAYMENT ID */}

                                                <div>

                                                    <p className="text-sm text-gray-500">
                                                        Payment ID
                                                    </p>

                                                    <p className="font-mono text-sm mt-1 break-all">

                                                        {
                                                            appointment.razorpayPaymentId ||
                                                            "Not available"
                                                        }

                                                    </p>

                                                </div>

                                            </div>

                                        </div>



                                        {/* =================================
                                            REFUND DETAILS
                                            SHOW ONLY WHEN A REFUND EXISTS
                                        ================================= */}

                                        {(
                                            appointment.refundStatus ===
                                                "Pending" ||
                                            appointment.refundStatus ===
                                                "Processed" ||
                                            appointment.refundStatus ===
                                                "Failed" ||
                                            appointment.paymentStatus ===
                                                "Refunding in Progress" ||
                                            appointment.paymentStatus ===
                                                "Refunded"
                                        ) && (

                                            <div className="mt-6 border-t pt-5">

                                                <h3 className="text-lg font-semibold mb-4">
                                                    Refund Details
                                                </h3>


                                                {/* REFUND AMOUNT */}

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                                                    <div className="bg-gray-50 rounded-lg p-4">

                                                        <p className="text-sm text-gray-500">
                                                            Refund Amount
                                                        </p>

                                                        <p className="font-semibold mt-1">

                                                            ₹
                                                            {
                                                                Number(
                                                                    appointment.refundAmount ||
                                                                        appointment.paymentAmount ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )
                                                            }

                                                        </p>

                                                    </div>


                                                    <div className="bg-gray-50 rounded-lg p-4">

                                                        <p className="text-sm text-gray-500">
                                                            Refund ID
                                                        </p>

                                                        <p className="font-mono text-sm mt-1 break-all">

                                                            {
                                                                appointment.refundId ||
                                                                "Processing"
                                                            }

                                                        </p>

                                                    </div>


                                                    <div className="bg-gray-50 rounded-lg p-4">

                                                        <p className="text-sm text-gray-500">
                                                            Refund Status
                                                        </p>

                                                        <span
                                                            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                                                                appointment.refundStatus ===
                                                                "Processed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : appointment.refundStatus ===
                                                                        "Failed"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-orange-100 text-orange-700"
                                                            }`}
                                                        >

                                                            {
                                                                appointment.refundStatus ===
                                                                "Processed"
                                                                    ? "Refund Completed"
                                                                    : appointment.refundStatus ===
                                                                        "Failed"
                                                                    ? "Refund Failed"
                                                                    : "Refunding in Progress"
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                {/* REFUND TIMELINE */}

                                                <div className="bg-gray-50 rounded-xl p-5">

                                                    <div className="space-y-0">

                                                        {/* REFUND INITIATED */}

                                                        <div className="flex items-start">

                                                            <div className="flex flex-col items-center mr-4">

                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                        appointment.refundStatus ===
                                                                            "Pending" ||
                                                                        appointment.refundStatus ===
                                                                            "Processed" ||
                                                                        appointment.refundStatus ===
                                                                            "Failed"
                                                                            ? "bg-green-600 text-white"
                                                                            : "bg-gray-300 text-gray-500"
                                                                    }`}
                                                                >
                                                                    ✓
                                                                </div>

                                                                <div className="w-0.5 h-10 bg-gray-300" />

                                                            </div>


                                                            <div className="pb-6">

                                                                <p className="font-semibold text-gray-800">
                                                                    Refund Initiated
                                                                </p>

                                                                <p className="text-sm text-gray-500 mt-1">

                                                                    {
                                                                        appointment.refundInitiatedAt
                                                                            ? new Date(
                                                                                appointment.refundInitiatedAt
                                                                            ).toLocaleString()
                                                                            : "Refund request has been initiated."
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        {/* REFUND PROCESSING */}

                                                        <div className="flex items-start">

                                                            <div className="flex flex-col items-center mr-4">

                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                        appointment.refundStatus ===
                                                                        "Pending"
                                                                            ? "bg-orange-500 text-white"
                                                                            : appointment.refundStatus ===
                                                                                "Processed"
                                                                            ? "bg-green-600 text-white"
                                                                            : appointment.refundStatus ===
                                                                                "Failed"
                                                                            ? "bg-red-500 text-white"
                                                                            : "bg-gray-300 text-gray-500"
                                                                    }`}
                                                                >

                                                                    {
                                                                        appointment.refundStatus ===
                                                                        "Pending"
                                                                            ? "..."
                                                                            : appointment.refundStatus ===
                                                                                "Processed"
                                                                            ? "✓"
                                                                            : appointment.refundStatus ===
                                                                                "Failed"
                                                                            ? "!"
                                                                            : "2"
                                                                    }

                                                                </div>

                                                                <div className="w-0.5 h-10 bg-gray-300" />

                                                            </div>


                                                            <div className="pb-6">

                                                                <p className="font-semibold text-gray-800">
                                                                    Refunding in Progress
                                                                </p>

                                                                <p className="text-sm text-gray-500 mt-1">

                                                                    {
                                                                        appointment.refundStatus ===
                                                                        "Processed"
                                                                            ? "Refund processing is completed."
                                                                            : appointment.refundStatus ===
                                                                                "Failed"
                                                                            ? "Refund processing failed. Please contact support."
                                                                            : "Your refund is being processed by the payment gateway."
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        {/* REFUND COMPLETED */}

                                                        <div className="flex items-start">

                                                            <div className="flex flex-col items-center mr-4">

                                                                <div
                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                        appointment.refundStatus ===
                                                                        "Processed"
                                                                            ? "bg-green-600 text-white"
                                                                            : "bg-gray-300 text-gray-500"
                                                                    }`}
                                                                >
                                                                    {
                                                                        appointment.refundStatus ===
                                                                        "Processed"
                                                                            ? "✓"
                                                                            : "3"
                                                                    }
                                                                </div>

                                                            </div>


                                                            <div>

                                                                <p
                                                                    className={`font-semibold ${
                                                                        appointment.refundStatus ===
                                                                        "Processed"
                                                                            ? "text-green-700"
                                                                            : "text-gray-600"
                                                                    }`}
                                                                >
                                                                    Refund Completed
                                                                </p>

                                                                <p className="text-sm text-gray-500 mt-1">

                                                                    {
                                                                        appointment.refundStatus ===
                                                                        "Processed"
                                                                            ? (
                                                                                appointment.refundProcessedAt
                                                                                    ? `Completed on ${new Date(
                                                                                        appointment.refundProcessedAt
                                                                                    ).toLocaleString()}.`
                                                                                    : "Your refund has been completed."
                                                                            )
                                                                            : "The refund will be marked completed once the payment gateway confirms it."
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* FAILURE MESSAGE */}

                                                    {appointment.refundStatus ===
                                                        "Failed" && (

                                                        <div className="mt-5 rounded-lg bg-red-50 border border-red-200 p-4">

                                                            <p className="text-sm font-semibold text-red-700">
                                                                Refund could not be completed
                                                            </p>

                                                            <p className="text-sm text-red-600 mt-1">

                                                                {
                                                                    appointment.refundFailureReason ||
                                                                    "The refund could not be processed. Please contact support."
                                                                }

                                                            </p>

                                                        </div>

                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================
                                            ACTION BUTTONS
                                        ================================= */}

                                        <div className="mt-6 flex flex-wrap gap-3">

                                            {/* =============================
                                                CANCEL
                                                ONLY PENDING
                                            ============================== */}

                                            {appointment.status ===
                                                "Pending" && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancel(
                                                            appointment._id
                                                        )
                                                    }
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                                >
                                                    Cancel Appointment
                                                </button>

                                            )}


                                            {/* =============================
                                                REVIEW
                                                ONLY COMPLETED
                                            ============================== */}

                                            {isCompleted && (

                                                <Link
                                                    to={`/review/${appointment._id}`}
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                                                >
                                                    ⭐{" "}

                                                    {
                                                        existingReview
                                                            ? "Edit Review"
                                                            : "Write Review"
                                                    }

                                                </Link>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* =========================================
                LOCATION ACCESS MODAL
            ========================================= */}

            <LocationAccessModal
                open={showLocationModal}
                onSuccess={handleLocationSuccess}
                onClose={() => {
                    setShowLocationModal(false);
                    setSelectedHospital(null);
                }}
                onDenied={handleLocationDenied}
            />

        </MainLayout>

    );

}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
    getMyAppointments,
    cancelAppointment,
} from "../services/appointmentService";

import {
    getMyReviews
} from "../services/reviewService";

export default function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchReviews();
    }, []);

    const fetchAppointments = async () => {

        try {

            const data = await getMyAppointments();

            setAppointments(data.appointments || []);

        } catch (err) {

            console.log(err);

        }

    };

    const fetchReviews = async () => {

        try {

            const data = await getMyReviews();

            setReviews(data.reviews || []);

        } catch (err) {

            console.log(err);

        }

    };

    const handleCancel = async (id) => {

        try {

            await cancelAppointment(id);

            fetchAppointments();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Unable to cancel appointment"
            );

        }

    };

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

    const getPaymentStatusClass = (status) => {

        switch (status) {

            case "Paid":
                return "bg-green-100 text-green-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            case "Failed":
                return "bg-red-100 text-red-700";

            case "Refunded":
                return "bg-blue-100 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }

    };

    return (

        <MainLayout>

            <div className="max-w-6xl mx-auto py-10 px-4">

                <h1 className="text-3xl font-bold mb-8">
                    My Appointments
                </h1>

                {appointments.length === 0 ? (

                    <div className="bg-white border rounded-xl p-8 text-center shadow">

                        <p className="text-gray-500">
                            You don't have any appointments yet.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-6">

                        {appointments.map((appointment) => {

                            const existingReview = reviews.find(
                                (review) =>
                                    review.appointment?._id === appointment._id ||
                                    review.appointment === appointment._id
                            );

                            return (

                                <div
                                    key={appointment._id}
                                    className="bg-white border rounded-xl p-6 shadow"
                                >

                                    {/* Doctor Information */}

                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                                        <div>

                                            <h2 className="text-xl font-semibold">
                                                Dr. {appointment.doctor?.user?.name}
                                            </h2>

                                            <p className="text-gray-600">
                                                {appointment.doctor?.specialization}
                                            </p>

                                            {appointment.doctor?.hospital && (

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {appointment.doctor.hospital}
                                                </p>

                                            )}

                                        </div>

                                        {/* Appointment Status */}

                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                                                appointment.status
                                            )}`}
                                        >
                                            {appointment.status}
                                        </span>

                                    </div>


                                    {/* Appointment Information */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

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


                                        <div className="bg-gray-50 rounded-lg p-4">

                                            <p className="text-sm text-gray-500">
                                                Appointment Time
                                            </p>

                                            <p className="font-semibold mt-1">

                                                {appointment.startTime}
                                                {" - "}
                                                {appointment.endTime}

                                            </p>

                                        </div>


                                        <div className="bg-gray-50 rounded-lg p-4">

                                            <p className="text-sm text-gray-500">
                                                Consultation Mode
                                            </p>

                                            <p className="font-semibold mt-1">
                                                {appointment.mode || "Offline"}
                                            </p>

                                        </div>


                                        <div className="bg-gray-50 rounded-lg p-4">

                                            <p className="text-sm text-gray-500">
                                                Reason
                                            </p>

                                            <p className="font-semibold mt-1">
                                                {appointment.reason}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Payment Information */}

                                    <div className="mt-6 border-t pt-5">

                                        <h3 className="text-lg font-semibold mb-4">
                                            Payment Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Payment Status
                                                </p>

                                                <span
                                                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusClass(
                                                        appointment.paymentStatus
                                                    )}`}
                                                >
                                                    {appointment.paymentStatus || "Pending"}
                                                </span>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Amount Paid
                                                </p>

                                                <p className="font-semibold mt-1">
                                                    ₹
                                                    {Number(
                                                        appointment.paymentAmount || 0
                                                    ).toLocaleString("en-IN")}
                                                </p>

                                            </div>


                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Payment ID
                                                </p>

                                                <p className="font-mono text-sm mt-1 break-all">

                                                    {appointment.razorpayPaymentId ||
                                                        "Not available"}

                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Action Buttons */}

                                    <div className="mt-6 flex flex-wrap gap-3">

                                        {/* Cancel Appointment */}

                                        {appointment.status === "Pending" && (

                                            <button
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


                                        {/* Review */}

                                        {(appointment.status === "Completed" ||
                                            appointment.status === "Rejected") && (

                                            <Link
                                                to={`/review/${appointment._id}`}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                                            >
                                                ⭐{" "}
                                                {existingReview
                                                    ? "Edit Review"
                                                    : "Write Review"}
                                            </Link>

                                        )}

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </MainLayout>

    );

}
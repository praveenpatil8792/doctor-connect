import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import {
    getDoctorAppointments,
    updateAppointmentStatus,
} from "../services/appointmentService";



const canCompleteAppointment = (appointment) => {

    const appointmentDate =
        new Date(appointment.appointmentDate);

    const [hours, minutes] =
        appointment.startTime
            .split(":")
            .map(Number);

    appointmentDate.setHours(
        hours,
        minutes,
        0,
        0
    );

    return new Date() >= appointmentDate;
};



export default function DoctorDashboard() {

    const [appointments, setAppointments] = useState([]);


    useEffect(() => {

        loadAppointments();

    }, []);


    // =====================================================
    // Load Doctor Appointments
    // =====================================================

    const loadAppointments = async () => {

        try {

            const data =
                await getDoctorAppointments();

            setAppointments(
                data.appointments || []
            );

        }

        catch (err) {

            console.log(err);

        }

    };


    // =====================================================
    // Update Appointment Status
    // =====================================================

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            await updateAppointmentStatus(
                id,
                status
            );

            await loadAppointments();

        }

        catch (err) {

            alert(
                err.response?.data?.message ||
                "Failed to update appointment"
            );

        }

    };


    return (

        <MainLayout>

            <div className="max-w-7xl mx-auto py-10">

                <h1 className="text-4xl font-bold mb-8">
                    Doctor Dashboard
                </h1>


                <div className="overflow-x-auto">

                    <table className="w-full border">

                        <thead className="bg-blue-600 text-white">

                            <tr>

                                <th className="p-3">
                                    Patient
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Time
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {appointments.map(
                                (appointment) => (

                                <tr
                                    key={appointment._id}
                                    className="border-b text-center"
                                >

                                    {/* Patient */}

                                    <td className="p-4">

                                        {appointment.patient?.name}

                                    </td>


                                    {/* Date */}

                                    <td>

                                        {new Date(
                                            appointment.appointmentDate
                                        ).toLocaleDateString()}

                                    </td>


                                    {/* Time */}

                                    <td>

                                        {appointment.startTime}

                                        {" - "}

                                        {appointment.endTime}

                                    </td>


                                    {/* Reason */}

                                    <td>

                                        {appointment.reason}

                                    </td>


                                    {/* Status */}

                                    <td>

                                        <span
                                            className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-white

                                                ${
                                                    appointment.status ===
                                                    "Accepted"

                                                        ? "bg-green-600"

                                                    : appointment.status ===
                                                      "Rejected"

                                                        ? "bg-red-600"

                                                    : appointment.status ===
                                                      "Completed"

                                                        ? "bg-blue-600"

                                                    : appointment.status ===
                                                      "Cancelled"

                                                        ? "bg-gray-600"

                                                    : appointment.status ===
                                                      "Expired"

                                                        ? "bg-orange-600"

                                                    : appointment.status ===
                                                      "Patient No-Show"

                                                        ? "bg-purple-600"

                                                    : appointment.status ===
                                                      "Doctor No-Show"

                                                        ? "bg-red-800"

                                                    : "bg-yellow-500"
                                                }
                                            `}
                                        >

                                            {appointment.status}

                                        </span>

                                    </td>


                                    {/* Actions */}

                                    <td className="space-x-2 p-3">


                                        {/* =========================
                                            PENDING
                                        ========================= */}

                                        {appointment.status ===
                                            "Pending" && (

                                            <>

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "Accepted"
                                                        )
                                                    }
                                                    className="
                                                        bg-green-600
                                                        text-white
                                                        px-3
                                                        py-1
                                                        rounded
                                                    "
                                                >
                                                    Accept
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "Rejected"
                                                        )
                                                    }
                                                    className="
                                                        bg-red-600
                                                        text-white
                                                        px-3
                                                        py-1
                                                        rounded
                                                    "
                                                >
                                                    Reject
                                                </button>

                                            </>

                                        )}


                                        {/* =========================
                                            ACCEPTED
                                        ========================= */}

                                        {appointment.status ===
                                             "Accepted" && (

                                             <button
                                                 onClick={() =>
                                                     updateStatus(
                                                         appointment._id,
                                                         "Completed"
                                                     )
                                                }
                                                disabled={
                                                     !canCompleteAppointment(
                                                     appointment
                                                )
                                            }
                                            className={`
                                                 text-white
                                                 px-3
                                                 py-1
                                                 rounded
                                                 ${
                                                     canCompleteAppointment(
                                                         appointment
                                                     )
                                                     ? "bg-blue-600 hover:bg-blue-700"
                                                     : "bg-gray-400 cursor-not-allowed"
                                                 }
                                            `}
                                             >
                                             {
                                             canCompleteAppointment(
                                                appointment
                                             )
                                             ? "Complete"
                                             : "Available at " +
                                             appointment.startTime
                                        }
                                        </button>

                                        )}


                                        {/* =========================
                                            EXPIRED
                                        ========================= */}

                                        {appointment.status ===
                                            "Expired" && (

                                            <div className="flex flex-wrap gap-2 justify-center">

                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "Completed"
                                                        )
                                                    }
                                                    className="
                                                        bg-blue-600
                                                        text-white
                                                        px-3
                                                        py-1
                                                        rounded
                                                    "
                                                >
                                                    Mark Completed
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "Patient No-Show"
                                                        )
                                                    }
                                                    className="
                                                        bg-purple-600
                                                        text-white
                                                        px-3
                                                        py-1
                                                        rounded
                                                    "
                                                >
                                                    Patient No-Show
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment._id,
                                                            "Doctor No-Show"
                                                        )
                                                    }
                                                    className="
                                                        bg-red-800
                                                        text-white
                                                        px-3
                                                        py-1
                                                        rounded
                                                    "
                                                >
                                                    Doctor No-Show
                                                </button>

                                            </div>

                                        )}


                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </MainLayout>

    );

}
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getMyAppointments,
    cancelAppointment
} from "../services/appointmentService";

export default function PatientDashboard() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {

        try {

            const data = await getMyAppointments();

            setAppointments(data.appointments);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleCancel = async (id) => {

        if (!window.confirm("Cancel this appointment?")) return;

        try {

            await cancelAppointment(id);

            fetchAppointments();

        } catch (error) {

            alert(error.response?.data?.message);

        }

    };

    if (loading) {

        return (
            <MainLayout>
                <h2 className="text-center py-20">
                    Loading Appointments...
                </h2>
            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div className="max-w-6xl mx-auto py-12 px-6">

                <h1 className="text-4xl font-bold mb-8">
                    My Appointments
                </h1>

                {appointments.length === 0 ? (

                    <div className="text-center py-20">

                        <h2 className="text-2xl font-semibold">

                            No Appointments Yet

                        </h2>

                    </div>

                ) : (

                    <div className="space-y-6">

                        {appointments.map((appointment) => (

                            <div
                                key={appointment._id}
                                className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-center"
                            >

                                <div className="flex items-center gap-5">

                                    <img
                                        src={
                                            appointment.doctor.user.profileImage?.url ||
                                            "https://placehold.co/100x100?text=Doctor"
                                        }
                                        className="w-20 h-20 rounded-full object-cover"
                                        alt=""
                                    />

                                    <div>

                                        <h2 className="text-xl font-bold">

                                            {appointment.doctor.user.name}

                                        </h2>

                                        <p>

                                            {appointment.doctor.specialization}

                                        </p>

                                        <p>

                                            {new Date(
                                                appointment.appointmentDate
                                            ).toLocaleDateString()}

                                        </p>

                                        <p>

                                            {appointment.startTime}
                                            {" - "}
                                            {appointment.endTime}

                                        </p>

                                    </div>

                                </div>

                                <div className="text-center mt-6 md:mt-0">

                                    <span
                                        className={`px-4 py-2 rounded-full text-white
                                        ${
                                            appointment.status === "Pending"
                                                ? "bg-yellow-500"
                                                : appointment.status === "Accepted"
                                                ? "bg-green-500"
                                                : appointment.status === "Rejected"
                                                ? "bg-red-500"
                                                : appointment.status === "Completed"
                                                ? "bg-blue-500"
                                                : "bg-gray-500"
                                        }`}
                                    >
                                        {appointment.status}
                                    </span>

                                    {appointment.status === "Pending" && (

                                        <button
                                            onClick={() =>
                                                handleCancel(appointment._id)
                                            }
                                            className="block mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                        >

                                            Cancel

                                        </button>

                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </MainLayout>

    );

}
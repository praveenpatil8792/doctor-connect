import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import {
    getDoctorAppointments
} from "../services/appointmentService";


export default function DoctorEarnings() {

    const [appointments, setAppointments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadAppointments();

    }, []);


    const loadAppointments = async () => {

        try {

            const data =
                await getDoctorAppointments();

            setAppointments(
                data.appointments || []
            );

        }

        catch (error) {

            console.error(
                "Earnings loading error:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    // Only completed appointments generate earnings
    const completedAppointments =
        appointments.filter(
            (appointment) =>
                appointment.status === "Completed"
        );


    // Doctor consultation fee
    const consultationFee =
        completedAppointments.length > 0 &&
        completedAppointments[0].doctor?.consultationFee
            ? completedAppointments[0].doctor.consultationFee
            : 0;


    const totalEarnings =
        completedAppointments.reduce(
            (total, appointment) => {

                return total +
                    (
                        appointment.doctor
                            ?.consultationFee || 0
                    );

            },
            0
        );


    if (loading) {

        return (

            <MainLayout>

                <div className="max-w-6xl mx-auto py-12 px-6">

                    <p className="text-center">
                        Loading earnings...
                    </p>

                </div>

            </MainLayout>

        );

    }


    return (

        <MainLayout>

            <div className="max-w-6xl mx-auto py-10 px-6">

                <h1 className="text-4xl font-bold mb-8">
                    My Earnings
                </h1>


                {/* Summary */}

                <div className="grid md:grid-cols-3 gap-6 mb-10">


                    {/* Total Earnings */}

                    <div className="bg-white shadow rounded-xl p-6">

                        <p className="text-gray-500">
                            Total Earnings
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-2">

                            ₹
                            {totalEarnings.toLocaleString(
                                "en-IN"
                            )}

                        </p>

                    </div>


                    {/* Completed Appointments */}

                    <div className="bg-white shadow rounded-xl p-6">

                        <p className="text-gray-500">
                            Completed Appointments
                        </p>

                        <p className="text-3xl font-bold mt-2">

                            {completedAppointments.length}

                        </p>

                    </div>


                    {/* Consultation Fee */}

                    <div className="bg-white shadow rounded-xl p-6">

                        <p className="text-gray-500">
                            Consultation Fee
                        </p>

                        <p className="text-3xl font-bold text-blue-600 mt-2">

                            ₹
                            {consultationFee.toLocaleString(
                                "en-IN"
                            )}

                        </p>

                    </div>

                </div>


                {/* Completed Appointments */}

                <div className="bg-white shadow rounded-xl p-6">

                    <h2 className="text-2xl font-bold mb-6">

                        Completed Appointments

                    </h2>


                    {completedAppointments.length === 0 ? (

                        <p className="text-gray-500">

                            No completed appointments yet.

                        </p>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b">

                                        <th className="text-left p-3">
                                            Patient
                                        </th>

                                        <th className="text-left p-3">
                                            Date
                                        </th>

                                        <th className="text-left p-3">
                                            Time
                                        </th>

                                        <th className="text-left p-3">
                                            Amount
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {completedAppointments.map(
                                        (appointment) => (

                                            <tr
                                                key={
                                                    appointment._id
                                                }
                                                className="border-b"
                                            >

                                                <td className="p-3">

                                                    {
                                                        appointment
                                                            .patient
                                                            ?.name
                                                    }

                                                </td>


                                                <td className="p-3">

                                                    {new Date(
                                                        appointment.appointmentDate
                                                    ).toLocaleDateString()}

                                                </td>


                                                <td className="p-3">

                                                    {
                                                        appointment.startTime
                                                    }

                                                </td>


                                                <td className="p-3 font-semibold text-green-600">

                                                    ₹
                                                    {
                                                        appointment
                                                            .doctor
                                                            ?.consultationFee || 0
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </MainLayout>

    );

}
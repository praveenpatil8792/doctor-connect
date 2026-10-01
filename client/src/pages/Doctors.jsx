import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DoctorCard from "../components/doctor/DoctorCard";
import { getAllDoctors } from "../services/doctorService";

export default function Doctors() {

    // ONLY ONE declaration
    const [searchParams] = useSearchParams();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [specialization, setSpecialization] = useState(
        searchParams.get("specialization") || ""
    );

    useEffect(() => {
        const specializationFromUrl =
            searchParams.get("specialization") || "";

        setSpecialization(specializationFromUrl);
    }, [searchParams]);

    useEffect(() => {
        fetchDoctors();
    }, [search, specialization]);

    const fetchDoctors = async () => {

        try {

            setLoading(true);

            const data = await getAllDoctors({
                search,
                specialization
            });

            setDoctors(data.doctors);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {
        return (
            <MainLayout>
                <h2 className="text-center py-20">
                    Loading Doctors...
                </h2>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            <div className="max-w-7xl mx-auto px-6 py-12">

                <h1 className="text-4xl font-bold mb-10">
                    Find Doctors
                </h1>

                <div className="flex flex-col md:flex-row gap-4 mb-8">

                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg px-4 py-3 flex-1"
                    />

                    <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="border rounded-lg px-4 py-3"
                    >
                        <option value="">All Specializations</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Dentist">Dentist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Orthopedic">Orthopedic</option>
                    </select>

                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {doctors.map((doctor) => (
                        <DoctorCard
                            key={doctor._id}
                            doctor={doctor}
                        />
                    ))}

                </div>

            </div>

        </MainLayout>
    );
}
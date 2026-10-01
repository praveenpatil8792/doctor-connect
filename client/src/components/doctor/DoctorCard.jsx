import { Link } from "react-router-dom";

export default function DoctorCard({ doctor }) {

    return (

        <div className="border rounded-xl p-6 shadow-sm hover:shadow-lg transition">

            <div className="flex flex-col items-center text-center">

                <img
                    src={
                        doctor.profilePhoto
                            ? `http://localhost:5000/${doctor.profilePhoto}`
                            : "/default-doctor.png"
                    }
                    alt={doctor.user?.name || "Doctor"}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                />

                <h2 className="text-xl font-semibold">
                    Dr. {doctor.user?.name}
                </h2>

                <p className="text-blue-600 font-medium mt-1">
                    {doctor.specialization}
                </p>

                <p className="text-gray-600 mt-1">
                    {doctor.qualification}
                </p>

                <p className="text-gray-600">
                    {doctor.experience} years experience
                </p>

                <p className="font-semibold mt-3">
                    ₹{doctor.consultationFee}
                </p>

                <Link
                    to={`/doctor/${doctor._id}`}
                    className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                    View Details
                </Link>

            </div>

        </div>

    );

}
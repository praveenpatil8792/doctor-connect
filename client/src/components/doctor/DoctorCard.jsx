import { Link } from "react-router-dom";

export default function DoctorCard({
    doctor,
    distanceKm
}) {
    return (
        <div className="rounded-xl border p-6 shadow-sm transition hover:shadow-lg">
            <div className="flex flex-col items-center text-center">

                <img
                    src={
                        doctor.profilePhoto
                            ? `http://localhost:5000/${doctor.profilePhoto}`
                            : "/default-doctor.png"
                    }
                    alt={doctor.user?.name || "Doctor"}
                    className="mb-4 h-24 w-24 rounded-full object-cover"
                />

                <h2 className="text-xl font-semibold">
                    Dr. {doctor.user?.name}
                </h2>

                <p className="mt-1 font-medium text-blue-600">
                    {doctor.specialization}
                </p>

                <p className="mt-1 text-gray-600">
                    {doctor.qualification}
                </p>

                <p className="text-gray-600">
                    {doctor.experience} years experience
                </p>

                <p className="mt-2 font-semibold text-yellow-600">
                    ★ {Number(doctor.averageRating || 0).toFixed(1)}
                    <span className="ml-1 text-sm font-normal text-gray-500">
                        ({doctor.totalReviews || 0} reviews)
                    </span>
                </p>

                {doctor.hospital && (
                    <p className="mt-2 text-gray-600">
                        🏥 {doctor.hospital}
                    </p>
                )}

                {doctor.location?.city && (
                    <p className="text-sm text-gray-500">
                        {doctor.location.city},{" "}
                        {doctor.location.state}
                    </p>
                )}

                {Number.isFinite(distanceKm) && (
                    <p className="mt-2 font-semibold text-green-600">
                        📍 {distanceKm.toFixed(1)} km away
                    </p>
                )}

                <p className="mt-3 font-semibold">
                    ₹{doctor.consultationFee}
                </p>

                <Link
                    to={`/doctor/${doctor._id}`}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    View Details
                </Link>

            </div>
        </div>
    );
}
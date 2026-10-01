import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { getDoctorById } from "../services/doctorService";
import { getDoctorReviewsByDoctorId } from "../services/reviewService";
import ReviewCard from "../components/review/ReviewCard";
import RelatedDoctors from "../components/doctor/RelatedDoctors";

export default function DoctorDetails() {

    const { id } = useParams();

    const [doctor, setDoctor] = useState(null);

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctor();
    }, []);

    const fetchDoctor = async () => {

    try {

        // First get doctor
        const doctorData = await getDoctorById(id);

        console.log("Doctor response:", doctorData);

        setDoctor(doctorData.doctor);


        // Get reviews separately
        try {

            const reviewData = await getDoctorReviewsByDoctorId(id);

            console.log("Review response:", reviewData);

            setReviews(reviewData.reviews || []);

        } catch (reviewError) {

            console.log("Review loading failed:", reviewError);

            // Doctor should still be displayed
            setReviews([]);

        }

    } catch (error) {

        console.log("Doctor loading failed:", error);

        setDoctor(null);

    } finally {

        setLoading(false);

    }

};
    if (loading) {

        return (
            <MainLayout>
                <h2 className="text-center py-20">
                    Loading...
                </h2>
            </MainLayout>
        );

    }

    if (!doctor) {

        return (
            <MainLayout>
                <h2 className="text-center py-20">
                    Doctor not found
                </h2>
            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div className="max-w-7xl mx-auto px-6 py-10">

                 <div className="bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-3 gap-8">

                     <div>

                          <img
                              src={
                                  doctor.user?.profileImage
                                  ? `http://localhost:5000/${doctor.user.profileImage}`
                                  : "https://placehold.co/500x500?text=Doctor"
                              }
                              alt={doctor.user?.name || "Doctor"}
                              className="rounded-xl w-full object-cover"
                          />

                    </div>

                    <div className="md:col-span-2">

                    <h1 className="text-4xl font-bold">
                         {doctor.user.name}
                    </h1>

                    <p className="text-xl text-blue-600 mt-2">
                         {doctor.specialization}
                    </p>

                    <div className="flex gap-6 mt-5">

                         <p>⭐ {doctor.averageRating}</p>

                         <p>{doctor.experience} Years Experience</p>

                    </div>

                    <p className="mt-4">
                         <strong>Qualification :</strong>{" "}
                         {doctor.qualification}
                    </p>

                    <p className="mt-2">
                         <strong>Hospital :</strong>{" "}
                         {doctor.hospital}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-600">
                         ₹{doctor.consultationFee}
                    </p>

                    <h3 className="mt-8 text-2xl font-semibold">
                         About Doctor
                    </h3>

                    <p className="mt-3 text-gray-600 leading-7">
                         {doctor.about}
                    </p>

                    <Link
                         to={`/book/${doctor._id}`}
                         className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                    Book Appointment
                    </Link> 

                </div>

           </div>

           </div>

                 <div className="mt-16">

                 <h2 className="text-3xl font-bold mb-8">

                    Patient Reviews

                </h2>

                   {reviews.length === 0 ? (

                         <div className="bg-gray-100 rounded-xl p-6">

                             No reviews yet.

                         </div>

                    ) : (

                        reviews.map((review) => (

                             <ReviewCard
                                 key={review._id}
                                 review={review}
                            />

                        ))

                 )}

            </div>
            <RelatedDoctors

                specialization={doctor.specialization}

                currentDoctorId={doctor._id}

            />

        </MainLayout>

    );

}
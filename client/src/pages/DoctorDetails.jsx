import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { getDoctorById } from "../services/doctorService";
import { getDoctorReviewsByDoctorId } from "../services/reviewService";

import ReviewCard from "../components/review/ReviewCard";
import RelatedDoctors from "../components/doctor/RelatedDoctors";
import LocationAccessModal from "../components/common/LocationAccessModal";

import {
    getDirectionsUrl,
    getHospitalMapUrl,
    getStoredLocation
} from "../utils/location";

export default function DoctorDetails() {

    const { id } = useParams();

    const [doctor, setDoctor] = useState(null);

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const [locationModalOpen, setLocationModalOpen] = useState(false);

    const [locationMessage, setLocationMessage] = useState("");

    useEffect(() => {
        fetchDoctor();
    }, []);

    const fetchDoctor = async () => {

        try {

            // Get doctor
            const doctorData = await getDoctorById(id);

            console.log("Doctor response:", doctorData);

            setDoctor(doctorData.doctor);

            // Get reviews
            try {

                const reviewData =
                    await getDoctorReviewsByDoctorId(id);

                console.log("Review response:", reviewData);

                setReviews(reviewData.reviews || []);

            } catch (reviewError) {

                console.log(
                    "Review loading failed:",
                    reviewError
                );

                setReviews([]);

            }

        } catch (error) {

            console.log(
                "Doctor loading failed:",
                error
            );

            setDoctor(null);

        } finally {

            setLoading(false);

        }
    };

    /*
     * ------------------------------------------------
     * VIEW HOSPITAL MAP
     * ------------------------------------------------
     */

    const handleViewMap = () => {

        if (!doctor?.location) {
            return;
        }

        const latitude =
            Number(doctor.location.latitude);

        const longitude =
            Number(doctor.location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return;
        }

        setLocationMessage("");

        /*
         * Check whether patient location
         * is already available.
         */

        const storedLocation =
            getStoredLocation();

        /*
         * --------------------------------------------
         * LOCATION ALREADY AVAILABLE
         * --------------------------------------------
         */

        if (storedLocation) {

            const directionsUrl =
                getDirectionsUrl(
                    latitude,
                    longitude,
                    storedLocation.latitude,
                    storedLocation.longitude
                );

            window.open(
                directionsUrl,
                "_blank",
                "noopener,noreferrer"
            );

            return;
        }

        /*
         * --------------------------------------------
         * LOCATION NOT AVAILABLE
         * --------------------------------------------
         *
         * Ask patient for location access.
         */

        setLocationModalOpen(true);
    };

    /*
     * ------------------------------------------------
     * LOCATION ACCESS SUCCESS
     * ------------------------------------------------
     */

    const handleLocationSuccess = (location) => {

        if (!doctor?.location) {
            setLocationModalOpen(false);
            return;
        }

        const latitude =
            Number(doctor.location.latitude);

        const longitude =
            Number(doctor.location.longitude);

        const directionsUrl =
            getDirectionsUrl(
                latitude,
                longitude,
                location.latitude,
                location.longitude
            );

        setLocationModalOpen(false);

        window.open(
            directionsUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /*
     * ------------------------------------------------
     * LOCATION ACCESS DENIED
     * ------------------------------------------------
     *
     * If patient does not provide location,
     * simply show the hospital location on map.
     */

    const handleLocationDenied = () => {

        if (!doctor?.location) {
            setLocationModalOpen(false);
            return;
        }

        const latitude =
            Number(doctor.location.latitude);

        const longitude =
            Number(doctor.location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            setLocationModalOpen(false);
            return;
        }

        const hospitalMapUrl =
            getHospitalMapUrl(
                latitude,
                longitude
            );

        setLocationModalOpen(false);

        window.open(
            hospitalMapUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /*
     * ------------------------------------------------
     * LOADING
     * ------------------------------------------------
     */

    if (loading) {

        return (
            <MainLayout>

                <h2 className="py-20 text-center">
                    Loading...
                </h2>

            </MainLayout>
        );

    }

    /*
     * ------------------------------------------------
     * DOCTOR NOT FOUND
     * ------------------------------------------------
     */

    if (!doctor) {

        return (
            <MainLayout>

                <h2 className="py-20 text-center">
                    Doctor not found
                </h2>

            </MainLayout>
        );

    }

    return (

        <MainLayout>

            <div className="mx-auto max-w-7xl px-6 py-10">

                <div className="grid gap-8 rounded-2xl bg-white p-8 shadow-lg md:grid-cols-3">

                    {/* =========================================
                        DOCTOR IMAGE
                    ========================================== */}

                    <div>

                        <img
                            src={
                                doctor.user?.profileImage
                                    ? `http://localhost:5000/${doctor.user.profileImage}`
                                    : "https://placehold.co/500x500?text=Doctor"
                            }
                            alt={
                                doctor.user?.name ||
                                "Doctor"
                            }
                            className="w-full rounded-xl object-cover"
                        />

                    </div>


                    {/* =========================================
                        DOCTOR DETAILS
                    ========================================== */}

                    <div className="md:col-span-2">

                        <h1 className="text-4xl font-bold">

                            {doctor.user?.name}

                        </h1>


                        <p className="mt-2 text-xl text-blue-600">

                            {doctor.specialization}

                        </p>


                        <div className="mt-5 flex gap-6">

                            <p>
                                ⭐ {doctor.averageRating}
                            </p>

                            <p>
                                {doctor.experience} Years Experience
                            </p>

                        </div>


                        <p className="mt-4">

                            <strong>
                                Qualification :
                            </strong>{" "}

                            {doctor.qualification}

                        </p>


                        <p className="mt-2">

                            <strong>
                                Hospital :
                            </strong>{" "}

                            {doctor.hospital}

                        </p>


                        {/* =====================================
                            HOSPITAL LOCATION
                        ====================================== */}

                        {doctor.location?.address && (

                            <div className="mt-5 rounded-xl bg-gray-50 p-5">

                                <h3 className="text-lg font-semibold">

                                    Hospital Location

                                </h3>


                                <p className="mt-2 text-gray-600">

                                    {doctor.location.address}

                                </p>


                                <p className="text-gray-600">

                                    {doctor.location.city},{" "}
                                    {doctor.location.state}
                                    {" - "}
                                    {doctor.location.pincode}

                                </p>


                                {/* =================================
                                    VIEW IN MAP BUTTON
                                ================================== */}

                                {Number.isFinite(
                                    Number(
                                        doctor.location.latitude
                                    )
                                ) &&
                                Number.isFinite(
                                    Number(
                                        doctor.location.longitude
                                    )
                                ) && (

                                    <button
                                        type="button"
                                        onClick={handleViewMap}
                                        className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
                                    >
                                        🗺️ View in Map
                                    </button>

                                )}

                                {locationMessage && (

                                    <p className="mt-3 text-sm text-red-600">

                                        {locationMessage}

                                    </p>

                                )}

                            </div>

                        )}


                        <p className="mt-5 text-2xl font-bold text-blue-600">

                            ₹{doctor.consultationFee}

                        </p>


                        <h3 className="mt-8 text-2xl font-semibold">

                            About Doctor

                        </h3>


                        <p className="mt-3 leading-7 text-gray-600">

                            {doctor.about}

                        </p>


                        <Link
                            to={`/book/${doctor._id}`}
                            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                        >

                            Book Appointment

                        </Link>

                    </div>

                </div>


                {/* =========================================
                    REVIEWS
                ========================================== */}

                <div className="mt-16">

                    <h2 className="mb-8 text-3xl font-bold">

                        Patient Reviews

                    </h2>


                    {reviews.length === 0 ? (

                        <div className="rounded-xl bg-gray-100 p-6">

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


                {/* =========================================
                    RELATED DOCTORS
                ========================================== */}

                <RelatedDoctors
                    specialization={
                        doctor.specialization
                    }
                    currentDoctorId={
                        doctor._id
                    }
                />

            </div>


            {/* =============================================
                LOCATION ACCESS MODAL
            ============================================== */}

            <LocationAccessModal
                open={locationModalOpen}
                title="Location Access Required"
                description="Allow location access to get directions from your current location to this hospital. If you do not allow access, you can still view the hospital location on the map."
                onSuccess={handleLocationSuccess}
                onDenied={handleLocationDenied}
                onClose={() =>
                    setLocationModalOpen(false)
                }
            />

        </MainLayout>

    );
}
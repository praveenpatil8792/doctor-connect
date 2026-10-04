import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DoctorCard from "../components/doctor/DoctorCard";
import LocationAccessModal from "../components/common/LocationAccessModal";
import { getAllDoctors } from "../services/doctorService";
import {
    calculateDistanceKm,
    getHospitalMapUrl,
    getStoredLocation
} from "../utils/location";
import { useSelector } from "react-redux";

export default function Doctors() {
    const [searchParams] = useSearchParams();
    const { user, token } = useSelector((state) => state.auth);

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [specialization, setSpecialization] = useState(
        searchParams.get("specialization") || ""
    );
    const [userLocation, setUserLocation] = useState(getStoredLocation());
    const [sortBy, setSortBy] = useState("default");
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");
    const [locationAction, setLocationAction] = useState("sort");
    const [pendingMapDoctor, setPendingMapDoctor] = useState(null);

    useEffect(() => {
        setSpecialization(searchParams.get("specialization") || "");
    }, [searchParams]);

    useEffect(() => {
        fetchDoctors();
    }, [search, specialization, sortBy]);

    useEffect(() => {
        const handleLocationUpdated = (event) => {
            setUserLocation(event.detail);
            setLocationMessage("");
        };

        window.addEventListener(
            "doctorconnect-location-updated",
            handleLocationUpdated
        );

        return () =>
            window.removeEventListener(
                "doctorconnect-location-updated",
                handleLocationUpdated
            );
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);

            const data = await getAllDoctors({
                search,
                specialization,
                sortBy
            });

            setDoctors(data.doctors || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (event) => {
        const value = event.target.value;
        setLocationMessage("");

        if (value !== "nearest") {
            setSortBy(value);
            return;
        }

        if (!token || user?.role !== "patient") {
            setLocationMessage(
                "Location-based sorting is available for logged-in patients."
            );
            setSortBy("default");
            return;
        }

        if (userLocation) {
            setSortBy("nearest");
            return;
        }

        setLocationAction("sort");
        setLocationModalOpen(true);
    };

    const handleLocationSuccess = (location) => {
        setUserLocation(location);

        if (locationAction === "map" && pendingMapDoctor?.location) {
            const latitude = Number(pendingMapDoctor.location.latitude);
            const longitude = Number(pendingMapDoctor.location.longitude);

            window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${latitude},${longitude}`,
                "_blank",
                "noopener,noreferrer"
            );

            setPendingMapDoctor(null);
        } else {
            setSortBy("nearest");
        }

        setLocationModalOpen(false);
        setLocationMessage("");
    };

    const handleLocationDeniedForSort = () => {
        setSortBy("default");
        setLocationModalOpen(false);
        setLocationMessage(
            "For location-based sorting, you must provide location access."
        );
    };

    const handleMapLocationDenied = () => {
        if (pendingMapDoctor?.location) {
            const latitude = Number(pendingMapDoctor.location.latitude);
            const longitude = Number(pendingMapDoctor.location.longitude);

            window.open(
                getHospitalMapUrl(latitude, longitude),
                "_blank",
                "noopener,noreferrer"
            );
        }

        setPendingMapDoctor(null);
        setLocationModalOpen(false);
    };

    const handleLocationModalClose = () => {
        setLocationModalOpen(false);

        if (locationAction === "sort") {
            setSortBy("default");
        }
    };

    const doctorsWithDistance = useMemo(
        () =>
            doctors.map((doctor) => ({
                ...doctor,
                distanceKm:
                    userLocation && doctor.location
                        ? calculateDistanceKm(
                              userLocation.latitude,
                              userLocation.longitude,
                              Number(doctor.location.latitude),
                              Number(doctor.location.longitude)
                          )
                        : null
            })),
        [doctors, userLocation]
    );

    const displayedDoctors = useMemo(() => {
        const result = [...doctorsWithDistance];

        if (sortBy === "nearest" && userLocation) {
            return result.sort((a, b) => {
                if (a.distanceKm === null) return 1;
                if (b.distanceKm === null) return -1;
                return a.distanceKm - b.distanceKm;
            });
        }

        // Rating and fee sorting are performed by the backend so that
        // sorting remains correct even when the doctor list is paginated.
        return result;
    }, [doctorsWithDistance, sortBy, userLocation]);

    if (loading) {
        return (
            <MainLayout>
                <h2 className="py-20 text-center">Loading Doctors...</h2>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl px-6 py-12">
                <h1 className="mb-10 text-4xl font-bold">Find Doctors</h1>

                <div className="mb-4 flex flex-col gap-4 md:flex-row">
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 rounded-lg border px-4 py-3"
                    />

                    <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="rounded-lg border px-4 py-3"
                    >
                        <option value="">All Specializations</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Dentist">Dentist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Orthopedic">Orthopedic</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="rounded-lg border px-4 py-3"
                    >
                        <option value="default">Sort: Default</option>
                        <option value="ratingDesc">Rating: High to Low</option>
                        <option value="ratingAsc">Rating: Low to High</option>
                        <option value="feeAsc">Fee: Low to High</option>
                        <option value="feeDesc">Fee: High to Low</option>
                        <option value="nearest">Sort by Location</option>
                    </select>
                </div>

                {locationMessage && (
                    <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700">
                        {locationMessage}
                    </div>
                )}

                {userLocation && (
                    <p className="mb-8 text-sm text-gray-500">
                        Location access is enabled. Choose “Sort by Location” to
                        show the nearest doctors first.
                    </p>
                )}

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {displayedDoctors.map((doctor) => (
                        <DoctorCard
                            key={doctor._id}
                            doctor={doctor}
                            distanceKm={doctor.distanceKm}
                            userLocation={userLocation}
                            onRequestLocation={() => {
                                setPendingMapDoctor(doctor);
                                setLocationAction("map");
                                setLocationModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            </div>

            <LocationAccessModal
                open={locationModalOpen}
                title="Location Access Required"
                description={
                    locationAction === "sort"
                        ? "To sort doctors by distance, DoctorConnect needs access to your current location."
                        : "Allow location access to get directions from your current location to this hospital."
                }
                onSuccess={handleLocationSuccess}
                onClose={handleLocationModalClose}
                onDenied={
                    locationAction === "sort"
                        ? handleLocationDeniedForSort
                        : handleMapLocationDenied
                }
            />
        </MainLayout>
    );
}

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LocationAccessModal from "../components/common/LocationAccessModal";
import {
    getStoredLocation,
    hasShownLocationPrompt
} from "../utils/location";

export default function MainLayout({ children }) {
    const { user, token } = useSelector((state) => state.auth);
    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        if (
            token &&
            user?.role === "patient" &&
            !getStoredLocation() &&
            !hasShownLocationPrompt()
        ) {
            setShowLocationModal(true);
        }
    }, [token, user?.role]);

    const handleLocationSuccess = () => {
        setShowLocationModal(false);
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-50">
                {children}
            </main>

            <Footer />

            {token && user?.role === "patient" && (
                <LocationAccessModal
                    open={showLocationModal}
                    onSuccess={handleLocationSuccess}
                    onClose={() => setShowLocationModal(false)}
                />
            )}
        </>
    );
}

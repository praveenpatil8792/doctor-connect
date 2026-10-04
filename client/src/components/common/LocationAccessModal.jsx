import { useEffect, useState } from "react";
import {
    markLocationPromptShown,
    requestAndStoreLocation
} from "../../utils/location";

export default function LocationAccessModal({
    open,
    title = "Allow Location Access",
    description = "Allow DoctorConnect to use your current location to find nearby doctors and calculate distances.",
    onSuccess,
    onClose,
    onDenied
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setError("");
            setLoading(false);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleAllow = async () => {
        try {
            setLoading(true);
            setError("");

            const location = await requestAndStoreLocation();

            markLocationPromptShown();

            onSuccess?.(location);
        } catch (err) {
            if (onDenied) {
                markLocationPromptShown();
                onDenied(err);
                onClose?.();
                return;
            }

            setError(err.message || "Unable to access your location.");
        } finally {
            setLoading(false);
        }
    };

    const handleNotNow = () => {
        markLocationPromptShown();
        onDenied?.();
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        📍
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>

                    <p className="mt-3 text-gray-600">
                        {description}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                        Your location is used only in your browser for distance
                        calculation and map directions. It is not saved in your
                        DoctorConnect database.
                    </p>
                </div>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={handleAllow}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Requesting Location..." : "Allow Location Access"}
                    </button>

                    <button
                        type="button"
                        onClick={handleNotNow}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
}

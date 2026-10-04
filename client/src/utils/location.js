const LOCATION_STORAGE_KEY = "doctorConnectPatientLocation";

export const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
            (error) => {
                const messages = {
                    1: "Location permission was denied.",
                    2: "Your location could not be determined.",
                    3: "Location request timed out."
                };

                reject(
                    new Error(
                        messages[error.code] || "Unable to get your location."
                    )
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });

export const getStoredLocation = () => {
    try {
        const stored = sessionStorage.getItem(LOCATION_STORAGE_KEY);

        if (!stored) {
            return null;
        }

        const location = JSON.parse(stored);

        if (
            !Number.isFinite(Number(location.latitude)) ||
            !Number.isFinite(Number(location.longitude))
        ) {
            return null;
        }

        return {
            latitude: Number(location.latitude),
            longitude: Number(location.longitude)
        };
    } catch {
        return null;
    }
};

export const saveStoredLocation = (location) => {
    const normalizedLocation = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
    };

    sessionStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(normalizedLocation)
    );

    window.dispatchEvent(
        new CustomEvent("doctorconnect-location-updated", {
            detail: normalizedLocation
        })
    );

    return normalizedLocation;
};

export const clearStoredLocation = () => {
    sessionStorage.removeItem(LOCATION_STORAGE_KEY);
    sessionStorage.removeItem("doctorConnectLocationPromptShown");
};

export const requestAndStoreLocation = async () => {
    const location = await getCurrentLocation();
    return saveStoredLocation(location);
};

export const markLocationPromptShown = () => {
    sessionStorage.setItem("doctorConnectLocationPromptShown", "true");
};

export const hasShownLocationPrompt = () =>
    sessionStorage.getItem("doctorConnectLocationPromptShown") === "true";

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getDirectionsUrl = (
    latitude,
    longitude,
    userLatitude,
    userLongitude
) => {
    const destination = `${latitude},${longitude}`;

    if (
        Number.isFinite(Number(userLatitude)) &&
        Number.isFinite(Number(userLongitude))
    ) {
        return `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${destination}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${destination}`;
};

export const getHospitalMapUrl = (latitude, longitude) =>
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

const searchNominatim = async (params) => {
    const url = new URL(
        "https://nominatim.openstreetmap.org/search"
    );

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            url.searchParams.set(key, String(value).trim());
        }
    });

    const response = await fetch(url, {
        headers: {
            "User-Agent": "DoctorConnect/1.0 (doctor location geocoding)",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `Location service returned HTTP ${response.status}`
        );
    }

    return await response.json();
};

const geocodeHospital = async ({
    hospital,
    address,
    city,
    state,
    pincode
}) => {
    const cleanHospital = hospital?.trim();
    const cleanAddress = address?.trim();
    const cleanCity = city?.trim();
    const cleanState = state?.trim();
    const cleanPincode = pincode?.trim();

    if (!cleanAddress || !cleanCity || !cleanState || !cleanPincode) {
        throw new Error(
            "Hospital address, city, state and PIN code are required."
        );
    }

    /*
     * ---------------------------------------------------------
     * ATTEMPT 1
     * Structured address search
     * ---------------------------------------------------------
     */

    let results = await searchNominatim({
        amenity: cleanHospital,
        street: cleanAddress,
        city: cleanCity,
        state: cleanState,
        postalcode: cleanPincode,
        country: "India",
        countrycodes: "in",
        format: "jsonv2",
        addressdetails: "1",
        limit: "5"
    });

    /*
     * ---------------------------------------------------------
     * ATTEMPT 2
     * Search using hospital + address as free text
     * ---------------------------------------------------------
     */

    if (!results.length) {
        const query = [
            cleanHospital,
            cleanAddress,
            cleanCity,
            cleanState,
            cleanPincode,
            "India"
        ]
            .filter(Boolean)
            .join(", ");

        results = await searchNominatim({
            q: query,
            countrycodes: "in",
            format: "jsonv2",
            addressdetails: "1",
            limit: "5"
        });
    }

    /*
     * ---------------------------------------------------------
     * ATTEMPT 3
     * Search without hospital name
     *
     * Sometimes the hospital name is not registered in OSM.
     * The actual street/address may still be available.
     * ---------------------------------------------------------
     */

    if (!results.length) {
        results = await searchNominatim({
            street: cleanAddress,
            city: cleanCity,
            state: cleanState,
            postalcode: cleanPincode,
            country: "India",
            countrycodes: "in",
            format: "jsonv2",
            addressdetails: "1",
            limit: "5"
        });
    }

    /*
     * ---------------------------------------------------------
     * ATTEMPT 4
     * PIN + city + state
     *
     * This gives us a fallback coordinate even when the
     * exact hospital is not mapped in OpenStreetMap.
     * ---------------------------------------------------------
     */

    if (!results.length) {
        results = await searchNominatim({
            postalcode: cleanPincode,
            city: cleanCity,
            state: cleanState,
            country: "India",
            countrycodes: "in",
            format: "jsonv2",
            addressdetails: "1",
            limit: "5"
        });
    }

    if (!results.length) {
        throw new Error(
            "Hospital address could not be located. Please check the address, city, state and PIN code."
        );
    }

    /*
     * Prefer a result that is actually in the requested city/state.
     */

    const normalizedCity = cleanCity.toLowerCase();
    const normalizedState = cleanState.toLowerCase();

    const matchingResult =
        results.find((result) => {
            const resultAddress = result.address || {};

            const resultCity = (
                resultAddress.city ||
                resultAddress.town ||
                resultAddress.village ||
                resultAddress.municipality ||
                ""
            ).toLowerCase();

            const resultState = (
                resultAddress.state ||
                ""
            ).toLowerCase();

            return (
                resultCity.includes(normalizedCity) ||
                normalizedCity.includes(resultCity)
            ) && (
                resultState.includes(normalizedState) ||
                normalizedState.includes(resultState)
            );
        }) || results[0];

    const latitude = Number(matchingResult.lat);
    const longitude = Number(matchingResult.lon);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        throw new Error(
            "Invalid coordinates were returned for this hospital address."
        );
    }

    console.log("Nominatim result:");
    console.log(matchingResult.display_name);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    return {
        latitude,
        longitude
    };
};

module.exports = geocodeHospital;
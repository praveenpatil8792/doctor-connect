import api from "../api/axios";

export const getAvailability = async () => {

    const response = await api.get("/doctor/availability");

    return response.data;
};

export const updateAvailability = async (data) => {

    const response = await api.put(
        "/doctor/availability",
        data
    );

    return response.data;
};
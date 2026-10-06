import api from "../api/axios";

export const getMeetingDetails = async (appointmentId) => {
    const response = await api.get(
        `/meeting/${appointmentId}`
    );

    return response.data;
};

import api from "../api/axios";

export const bookAppointment = async (appointmentData) => {
    const response = await api.post(
        "/appointment/book",
        appointmentData
    );

    return response.data;
};

export const getMyAppointments = async () => {

    const response = await api.get(
        "/appointment/my-appointments"
    );

    return response.data;

};

export const cancelAppointment = async (id) => {
    const response = await api.put(`/appointment/cancel/${id}`);

    return response.data;
};

export const getDoctorAppointments = async () => {

    const response = await api.get(
        "/appointment/doctor"
    );

    return response.data;
};

export const updateAppointmentStatus = async (
    id,
    status
) => {

    const response = await api.put(
        `/appointment/status/${id}`,
        { status }
    );

    return response.data;
};
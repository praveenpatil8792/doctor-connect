import api from "../api/axios";

export const getAllDoctors = async ({
    search = "",
    specialization = "",
    page = 1,
    limit = 8,
    sortBy = "default",
} = {}) => {

    const response = await api.get("/doctor/all", {
        params: {
            search,
            specialization,
            page,
            limit,
            sortBy,
        },
    });

    return response.data;
};

export const getDoctorById = async (id) => {

    const response = await api.get(`/doctor/${id}`);

    return response.data;
};

export const getAvailability = async () => {

    const response = await api.get(
        "/doctor/availability"
    );

    return response.data;
};

export const updateAvailability = async (
    availability
) => {

    const response = await api.put(
        "/doctor/availability",
        { availability }
    );

    return response.data;
};

// export const getDoctorSlots = async (
//     doctorId,
//     date
// ) => {

//     const response = await api.get(
//         `/doctor/${doctorId}/slots`,
//         {
//             params:{ date }
//         }
//     );

//     return response.data;

// };

export const getDoctorSlots = async (doctorId, date) => {
    const response = await api.get(
        `/doctor/${doctorId}/slots?date=${date}`
    );

    return response.data;
};

export const getDoctorProfile = async () => {
    const response = await api.get("/doctor/profile");
    return response.data;
};

export const updateHospitalLocation = async (locationData) => {
    const response = await api.put("/doctor/location", locationData);
    return response.data;
};

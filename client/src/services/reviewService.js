import api from "../api/axios";


export const getMyReviews = async () => {

    const response =
        await api.get("/review/my-reviews");

    return response.data;

};


export const getDoctorReviews = async () => {

    const response =
        await api.get("/review/doctor");

    return response.data;

};


export const getDoctorReviewsByDoctorId = async (doctorId) => {

    const response =
        await api.get(`/review/doctor/${doctorId}`);

    return response.data;

};


export const createReview = async (data) => {

    const response =
        await api.post("/review", data);

    return response.data;

};


// UPDATE REVIEW
export const updateReview = async (id, data) => {

    const response =
        await api.put(`/review/${id}`, data);

    return response.data;

};
import api from "../api/axios";


// =====================================================
// CREATE PAYMENT ORDER
// =====================================================

export const createPaymentOrder = async (
    appointmentData
) => {

    const response = await api.post(
        "/payment/create-order",
        appointmentData
    );

    return response.data;
};


// =====================================================
// VERIFY PAYMENT
// =====================================================

export const verifyPayment = async (
    paymentData
) => {

    const response = await api.post(
        "/payment/verify",
        paymentData
    );

    return response.data;
};
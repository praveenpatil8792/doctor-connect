const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware =
    require("../middleware/roleMiddleware");

const ROLES =
    require("../constants/roles");

const {
    createPaymentOrder,
    verifyPayment
} = require("../controllers/paymentController");


router.post(
    "/create-order",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    createPaymentOrder
);


router.post(
    "/verify",
    authMiddleware,
    roleMiddleware(ROLES.PATIENT),
    verifyPayment
);


module.exports = router;
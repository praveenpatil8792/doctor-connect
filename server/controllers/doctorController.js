const Doctor = require("../models/Doctor");

// Create Doctor Profile

const createDoctorProfile = async (req, res) => {

    try {

        const {
            specialization,
            qualification,
            experience,
            consultationFee,
            hospital,
            about
        } = req.body;

        if (
            !specialization ||
            !qualification ||
            !experience ||
            !consultationFee
        ) {

            return res.status(400).json({

                success:false,

                message:"Please fill all required fields"

            });

        }

        // Check if profile already exists

        const existingDoctor = await Doctor.findOne({
            user: req.user.id
        });

        if (existingDoctor) {

            return res.status(400).json({
                success: false,
                message: "Doctor profile already exists"
            });

        }

        const doctor = await Doctor.create({

            user: req.user.id,

            specialization,

            qualification,

            experience,

            consultationFee,

            hospital,

            about

        });

        res.status(201).json({

            success: true,
            message: "Doctor Profile Created",
            doctor

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// Get Logged-in Doctor Profile

const getDoctorProfile = async (req, res) => {

    try {

        const doctor = await Doctor.findOne({
            user: req.user.id
        }).populate(
            "user",
            "name email phone profileImage"
        );

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });

        }

        res.status(200).json({
            success: true,
            doctor
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update Doctor Profile

const updateDoctorProfile = async (req, res) => {

    try {

        const doctor = await Doctor.findOneAndUpdate(

            {
                user: req.user.id
            },

            req.body,

            {
                new: true,
                runValidators: true
            }

        ).populate(
            "user",
            "name email phone profileImage"
        );

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });

        }

        res.status(200).json({

            success: true,
            message: "Doctor Profile Updated",

            doctor

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Get All Doctors

const getAllDoctors = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";
        const specialization = req.query.specialization || "";

        // Build filter object
        let filter = {};

        if (specialization) {
            filter.specialization = specialization;
        }

        // Get doctors with populated user details
        let doctors = await Doctor.find(filter)
            .populate(
                "user",
                "name email phone profileImage"
            );

        // Search by doctor's name
        if (search) {
            doctors = doctors.filter((doctor) =>
                doctor.user.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        const totalDoctors = doctors.length;

        doctors = doctors.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            totalDoctors,
            currentPage: page,
            totalPages: Math.ceil(totalDoctors / limit),
            doctors
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Doctor By ID

const getDoctorById = async (req, res) => {

    try {

        const doctor = await Doctor.findById(req.params.id)
            .populate(
                "user",
                "name email phone profileImage"
            );

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });

        }

        res.status(200).json({

            success: true,

            doctor

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Delete Doctor Profile

const deleteDoctorProfile = async (req, res) => {

    try {

        const doctor = await Doctor.findOneAndDelete({
            user: req.user.id
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Doctor profile deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update Doctor Availability

const updateAvailability = async (req, res) => {

    try {

        const { availability, slotDuration } = req.body;

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });

        }

        doctor.availability = availability;

        doctor.slotDuration = slotDuration;

        await doctor.save();

        res.status(200).json({

            success: true,

            message: "Availability Updated",

            doctor

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {
    createDoctorProfile,
    getDoctorProfile,
    updateDoctorProfile,
    getAllDoctors,
    getDoctorById,
    deleteDoctorProfile,
    updateAvailability
};
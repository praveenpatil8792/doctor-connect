const Doctor = require("../models/Doctor");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const Appointment = require("../models/Appointment");
// const defaultAvailability = require("../constants/defaultAvailability");

const defaultAvailability = [
    {
        day: "Monday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Tuesday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Wednesday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Thursday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Friday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Saturday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    },
    {
        day: "Sunday",
        sessions: [
            {
                startTime: "09:00",
                endTime: "13:00"
            },
            {
                startTime: "14:00",
                endTime: "18:00"
            }
        ]
    }
];

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

        // Validate required fields FIRST
        if (
            !specialization ||
            !qualification ||
            experience === undefined ||
            experience === null ||
            consultationFee === undefined ||
            consultationFee === null
        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill all required fields"

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

        // Create doctor with default availability
        const doctor = await Doctor.create({

            user: req.user.id,

            specialization,

            qualification,

            experience,

            consultationFee,

            hospital,

            about,

            // Default weekly schedule
            availability: defaultAvailability,

            // 30 minute slots
            slotDuration: 30

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

// Upload Doctor Profile Photo

const uploadProfilePhoto = async (req, res) => {

    try {

        // No file uploaded
        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });

        }

        // Find logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Delete old image if it exists
        if (
            user.profileImage &&
            user.profileImage.public_id
        ) {

            await cloudinary.uploader.destroy(
                user.profileImage.public_id
            );

        }

        // Save new image
        user.profileImage = {

            url: req.file.path,

            public_id: req.file.filename

        };

        await user.save();

        res.status(200).json({

            success: true,

            message: "Profile Photo Uploaded Successfully",

            profileImage: user.profileImage

        });

    }

    catch (error) {

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

const getAvailability = async (req, res) => {

    try {

        const doctor = await Doctor.findOne({
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
            availability: doctor.availability,
            slotDuration: doctor.slotDuration
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getDoctorSlots = async (req, res) => {

    try {

        const { id } = req.params;

        const { date } = req.query;


        // =====================================================
        // 1. Validate date
        // =====================================================

        if (!date) {

            return res.status(400).json({

                success: false,

                message: "Date is required"

            });

        }


        // =====================================================
        // Date must be YYYY-MM-DD
        // =====================================================

        const datePattern =
            /^\d{4}-\d{2}-\d{2}$/;


        if (!datePattern.test(date)) {

            return res.status(400).json({

                success: false,

                message: "Invalid date format. Use YYYY-MM-DD"

            });

        }


        // =====================================================
        // 2. Validate actual calendar date
        // =====================================================

        const [year, month, day] =
            date.split("-").map(Number);


        const selectedDate = new Date(
            year,
            month - 1,
            day
        );


        if (

            selectedDate.getFullYear() !== year ||

            selectedDate.getMonth() !== month - 1 ||

            selectedDate.getDate() !== day

        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid date"

            });

        }


        // =====================================================
        // 3. Get today's date
        // =====================================================

        const now = new Date();


        const todayYear =
            now.getFullYear();

        const todayMonth =
            now.getMonth();

        const todayDay =
            now.getDate();


        const today = new Date(

            todayYear,

            todayMonth,

            todayDay

        );


        // =====================================================
        // 4. DO NOT RETURN SLOTS FOR PAST DATES
        // =====================================================

        if (selectedDate < today) {

            return res.status(200).json({

                success: true,

                date,

                slots: [],

                message:
                    "Appointments cannot be booked for a past date."

            });

        }


        // =====================================================
        // 5. Find doctor
        // =====================================================

        const doctor =
            await Doctor.findById(id);


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message: "Doctor not found"

            });

        }


        // =====================================================
        // 6. Check doctor availability
        // =====================================================

        if (

            !doctor.availability ||

            doctor.availability.length === 0

        ) {

            return res.status(200).json({

                success: true,

                slots: [],

                message:
                    "Doctor has not configured availability"

            });

        }


        // =====================================================
        // 7. Get day name
        // =====================================================

        const dayName =
            selectedDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        // =====================================================
        // 8. Find availability for selected day
        // =====================================================

        const dayAvailability =
            doctor.availability.find(

                item =>
                    item.day === dayName

            );


        if (!dayAvailability) {

            return res.status(200).json({

                success: true,

                slots: [],

                message:
                    `Doctor is not available on ${dayName}`

            });

        }


        // =====================================================
        // 9. Check sessions
        // =====================================================

        if (

            !dayAvailability.sessions ||

            dayAvailability.sessions.length === 0

        ) {

            return res.status(200).json({

                success: true,

                slots: [],

                message:
                    `Doctor has no sessions configured for ${dayName}`

            });

        }


        // =====================================================
        // 10. Generate slots
        // =====================================================

        let slots = [];


        for (
            const session
            of dayAvailability.sessions
        ) {

            if (

                !session.startTime ||

                !session.endTime

            ) {

                continue;

            }


            let [
                hour,
                minute
            ] = session.startTime
                .split(":")
                .map(Number);


            const [
                endHour,
                endMinute
            ] = session.endTime
                .split(":")
                .map(Number);


            const sessionEndMinutes =
                endHour * 60 +
                endMinute;


            while (true) {

                const currentMinutes =
                    hour * 60 +
                    minute;


                if (
                    currentMinutes >=
                    sessionEndMinutes
                ) {

                    break;

                }


                const nextMinutes =
                    currentMinutes +
                    doctor.slotDuration;


                if (
                    nextMinutes >
                    sessionEndMinutes
                ) {

                    break;

                }


                const slot =
                    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;


                slots.push(slot);


                hour =
                    Math.floor(
                        nextMinutes / 60
                    );


                minute =
                    nextMinutes % 60;

            }

        }


        // =====================================================
        // 11. Remove duplicate slots
        // =====================================================

        slots = [
            ...new Set(slots)
        ];


        // =====================================================
        // 12. If selected date is TODAY,
        //     remove slots that have already passed
        // =====================================================

        if (

            selectedDate.getFullYear() ===
                todayYear &&

            selectedDate.getMonth() ===
                todayMonth &&

            selectedDate.getDate() ===
                todayDay

        ) {

            const currentHour =
                now.getHours();

            const currentMinute =
                now.getMinutes();


            const currentTimeMinutes =
                currentHour * 60 +
                currentMinute;


            slots = slots.filter(
                (slot) => {

                    const [
                        slotHour,
                        slotMinute
                    ] = slot
                        .split(":")
                        .map(Number);


                    const slotMinutes =
                        slotHour * 60 +
                        slotMinute;


                    return (
                        slotMinutes >
                        currentTimeMinutes
                    );

                }
            );

        }


        // =====================================================
        // 13. Get appointments for selected date
        // =====================================================

        const startOfDay =
            new Date(
                year,
                month - 1,
                day,
                0,
                0,
                0,
                0
            );


        const endOfDay =
            new Date(
                year,
                month - 1,
                day,
                23,
                59,
                59,
                999
            );


        const appointments =
            await Appointment.find({

                doctor: id,

                appointmentDate: {

                    $gte: startOfDay,

                    $lte: endOfDay

                },

                status: {

                    $nin: [

                        "Rejected",

                        "Cancelled"

                    ]

                }

            });


        // =====================================================
        // 14. Get booked slots
        // =====================================================

        const bookedSlots =
            appointments.map(

                appointment =>
                    appointment.startTime

            );


        // =====================================================
        // 15. Remove booked slots
        // =====================================================

        const availableSlots =
            slots.filter(

                slot =>
                    !bookedSlots.includes(slot)

            );


        // =====================================================
        // 16. Return available slots
        // =====================================================

        return res.status(200).json({

            success: true,

            date,

            day: dayName,

            slotDuration:
                doctor.slotDuration,

            slots:
                availableSlots

        });

    }

    catch (error) {

        console.error(
            "Get Doctor Slots Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

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
    getAvailability,
    updateAvailability,
    uploadProfilePhoto,
    getDoctorSlots
    
};
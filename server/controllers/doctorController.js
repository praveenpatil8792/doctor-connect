const Doctor = require("../models/Doctor");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const Appointment = require("../models/Appointment");
const geocodeHospital = require("../services/geocodeHospital");
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

            offlineConsultationFee: Number(consultationFee),

            onlineConsultationFee: Number(consultationFee),

            offlineAppointmentsEnabled: true,

            onlineAppointmentsEnabled: true,

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
        const { name, email, phone, specialization, qualification, experience, nativeAddress, about, onlineConsultationFee, offlineConsultationFee, onlineAppointmentsEnabled, offlineAppointmentsEnabled } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
            if (existing) return res.status(409).json({ success: false, message: "Email is already in use" });
            user.email = email.toLowerCase();
        }
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        await user.save();

        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

        if (specialization !== undefined) doctor.specialization = specialization;
        if (qualification !== undefined) doctor.qualification = qualification;
        if (experience !== undefined && experience !== null && experience !== "") {
            const value = Number(experience);
            if (!Number.isFinite(value) || value < 0) return res.status(400).json({ success: false, message: "Experience must be a valid non-negative number" });
            doctor.experience = value;
        }
        if (nativeAddress !== undefined) doctor.nativeAddress = nativeAddress;
        if (about !== undefined) doctor.about = about;

        if (offlineConsultationFee !== undefined) {
            const value = Number(offlineConsultationFee);
            if (!Number.isFinite(value) || value < 0) return res.status(400).json({ success: false, message: "Offline consultation fee must be a valid non-negative number" });
            doctor.offlineConsultationFee = value;
            doctor.consultationFee = value;
        }
        if (onlineConsultationFee !== undefined) {
            const value = Number(onlineConsultationFee);
            if (!Number.isFinite(value) || value < 0) return res.status(400).json({ success: false, message: "Online consultation fee must be a valid non-negative number" });
            doctor.onlineConsultationFee = value;
        }
        if (offlineAppointmentsEnabled !== undefined) doctor.offlineAppointmentsEnabled = Boolean(offlineAppointmentsEnabled);
        if (onlineAppointmentsEnabled !== undefined) doctor.onlineAppointmentsEnabled = Boolean(onlineAppointmentsEnabled);

        await doctor.save();
        await doctor.populate("user", "name email phone profileImage");
        return res.status(200).json({ success: true, message: "Doctor Profile Updated", doctor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

// Update Hospital Location

const updateHospitalLocation = async (req, res) => {
    try {
        const { hospital, address, city, state, pincode } = req.body;

        if (!address || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "Hospital name, address, city, state and PIN code are required"
            });
        }

        const coordinates = await geocodeHospital({
            hospital, address, city, state, pincode
        });

        const doctor = await Doctor.findOneAndUpdate(
            { user: req.user.id },
            {
                hospital,
                location: {
                    address, city, state, pincode,
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                }
            },
            { new: true, runValidators: true }
        ).populate("user", "name email phone profileImage");

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor profile not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital location saved successfully",
            doctor
        });
    } catch (error) {
        console.error("Update Hospital Location Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Unable to locate hospital address"
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
        const sortBy = req.query.sortBy || "default";

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

        // Apply rating/fee sorting before pagination so the user gets the
        // correctly ranked doctors across the complete result set.
        if (sortBy === "ratingDesc") {
            doctors.sort(
                (a, b) =>
                    Number(b.averageRating || 0) -
                    Number(a.averageRating || 0)
            );
        } else if (sortBy === "ratingAsc") {
            doctors.sort(
                (a, b) =>
                    Number(a.averageRating || 0) -
                    Number(b.averageRating || 0)
            );
        } else if (sortBy === "feeAsc") {
            doctors.sort(
                (a, b) =>
                    Number(a.consultationFee || 0) -
                    Number(b.consultationFee || 0)
            );
        } else if (sortBy === "feeDesc") {
            doctors.sort(
                (a, b) =>
                    Number(b.consultationFee || 0) -
                    Number(a.consultationFee || 0)
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

// Convert HH:mm to minutes.
const timeToMinutes = (value) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return null;
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
};

const minutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const getCurrentWeekMonday = () => {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const day = date.getDay(); // Sunday = 0
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getMondayForDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setDate(date.getDate() + diff);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Backend slot generation used by the doctor's Confirm button.
const generateAvailabilitySlots = async (req, res) => {
    try {
        const { openingTime, closingTime, slotDuration } = req.body;
        const start = timeToMinutes(openingTime);
        const end = timeToMinutes(closingTime);
        const duration = Number(slotDuration);

        if (start === null || end === null) {
            return res.status(400).json({ success: false, message: "Opening and closing times must be valid times." });
        }

        if (start >= end) {
            return res.status(400).json({ success: false, message: "Opening time must be earlier than closing time." });
        }

        if (!Number.isInteger(duration) || duration < 5 || duration > 240) {
            return res.status(400).json({ success: false, message: "Slot duration must be between 5 and 240 minutes." });
        }

        const slots = [];
        for (let current = start; current + duration <= end; current += duration) {
            slots.push({
                startTime: minutesToTime(current),
                endTime: minutesToTime(current + duration)
            });
        }

        if (slots.length === 0) {
            return res.status(400).json({ success: false, message: "The selected opening/closing time is shorter than one slot." });
        }

        return res.status(200).json({ success: true, slots });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Save the doctor's weekly schedule for the current calendar week.
const updateAvailability = async (req, res) => {
    try {
        const {
            availability,
            slotDuration,
            offlineConsultationFee,
            onlineConsultationFee,
            offlineAppointmentsEnabled,
            onlineAppointmentsEnabled,
            availabilityWeekStart
        } = req.body;

        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

        const duration = Number(slotDuration);
        if (!Number.isInteger(duration) || duration < 5 || duration > 240) {
            return res.status(400).json({ success: false, message: "Slot duration must be between 5 and 240 minutes." });
        }

        if (!Array.isArray(availability)) {
            return res.status(400).json({ success: false, message: "Availability must be an array." });
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const normalizedAvailability = validDays.map((day) => {
            const item = availability.find((entry) => entry.day === day) || {};
            const holiday = Boolean(item.holiday);
            const sessions = Array.isArray(item.sessions) ? item.sessions : [];
            const excludedSlots = Array.isArray(item.excludedSlots) ? item.excludedSlots : [];

            if (holiday) return { day, sessions: [], excludedSlots: [], holiday: true };
            if (sessions.length > 1) {
                return { day, sessions, excludedSlots, holiday: false };
            }
            return { day, sessions, excludedSlots, holiday: false };
        });

        for (const day of normalizedAvailability) {
            for (const session of day.sessions) {
                const start = timeToMinutes(session.startTime);
                const end = timeToMinutes(session.endTime);
                if (start === null || end === null || start >= end) {
                    return res.status(400).json({ success: false, message: `${day.day}: opening time must be earlier than closing time.` });
                }
                if (end - start < duration) {
                    return res.status(400).json({ success: false, message: `${day.day}: working hours must contain at least one complete slot.` });
                }
            }
        }

        doctor.availability = normalizedAvailability;
        doctor.slotDuration = duration;
        doctor.availabilityWeekStart = availabilityWeekStart || getCurrentWeekMonday();

        if (offlineConsultationFee !== undefined) {
            const value = Number(offlineConsultationFee);
            if (!Number.isFinite(value) || value < 0) return res.status(400).json({ success: false, message: "Offline consultation fee must be a valid non-negative number" });
            doctor.offlineConsultationFee = value;
            doctor.consultationFee = value;
        }
        if (onlineConsultationFee !== undefined) {
            const value = Number(onlineConsultationFee);
            if (!Number.isFinite(value) || value < 0) return res.status(400).json({ success: false, message: "Online consultation fee must be a valid non-negative number" });
            doctor.onlineConsultationFee = value;
        }
        if (offlineAppointmentsEnabled !== undefined) doctor.offlineAppointmentsEnabled = Boolean(offlineAppointmentsEnabled);
        if (onlineAppointmentsEnabled !== undefined) doctor.onlineAppointmentsEnabled = Boolean(onlineAppointmentsEnabled);

        await doctor.save();

        return res.status(200).json({
            success: true,
            message: "Availability and appointment slots saved successfully",
            doctor,
            availabilityWeekStart: doctor.availabilityWeekStart
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.id });
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

        return res.status(200).json({
            success: true,
            availability: doctor.availability || [],
            availabilityWeekStart: doctor.availabilityWeekStart || "",
            slotDuration: doctor.slotDuration,
            offlineConsultationFee: Number(doctor.offlineConsultationFee || doctor.consultationFee || 0),
            onlineConsultationFee: Number(doctor.onlineConsultationFee || doctor.consultationFee || 0),
            offlineAppointmentsEnabled: doctor.offlineAppointmentsEnabled !== false,
            onlineAppointmentsEnabled: doctor.onlineAppointmentsEnabled !== false
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
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

        // Doctors configure only the current calendar week. Once the week changes,
        // the previous schedule is no longer bookable until the doctor saves a new week.
        const requestedWeekStart = getMondayForDate(date);
        if (!doctor.availabilityWeekStart || doctor.availabilityWeekStart !== requestedWeekStart) {
            return res.status(200).json({
                success: true,
                date,
                day: dayName,
                slots: [],
                message: "Doctor has not published availability for this week."
            });
        }


        // =====================================================
        // 8. Find availability for selected day
        // =====================================================

        const dayAvailability =
            doctor.availability.find(

                item =>
                    item.day === dayName

            );


        if (dayAvailability && dayAvailability.holiday) {
            return res.status(200).json({
                success: true,
                date,
                day: dayName,
                slots: [],
                message: `Doctor is on holiday on ${dayName}`
            });
        }

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

        const excludedSlots = Array.isArray(dayAvailability.excludedSlots)
            ? dayAvailability.excludedSlots
            : [];

        slots = slots.filter((slot) => !excludedSlots.includes(slot));


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
    generateAvailabilitySlots,
    updateAvailability,
    uploadProfilePhoto,
    getDoctorSlots,
    updateHospitalLocation
    
};
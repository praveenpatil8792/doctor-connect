const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const validator = require("validator");
const Doctor = require("../models/Doctor");
const ROLES = require("../constants/roles");

// Register User
const register = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role,
            phone,

            qualification,
            specialization,
            experience,
            consultationFee,
            hospital,
            about

        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            role: role || ROLES.PATIENT,
            phone

        });

        // Create doctor profile if role is doctor

        if (user.role === ROLES.DOCTOR) {

            await Doctor.create({

                user: user._id,

                specialization,

                qualification,

                experience,

                consultationFee,

                hospital,

                about,

                available: true,

                slotDuration: 30,

                averageRating: 0,

                totalReviews: 0

            });

        }

        const userResponse = {

            _id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            phone: user.phone,

            profileImage: user.profileImage

        };

        res.status(201).json({

            success: true,

            message: "Registration Successful",

            user: userResponse

        });

    }
    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};

// Login User
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Incorrect Password"
            });

        }

        const token = generateToken(user);

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage
        };

        res.status(200).json({
             success: true,
             message: "Login Successful",
             token,
             user: userResponse
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    register,
    login
};
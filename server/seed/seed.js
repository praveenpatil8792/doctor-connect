const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");

const createUsers = require("./users");
const createDoctors = require("./doctors");
const createAppointments = require("./appointments");
const createReviews = require("./reviews");

const seed = async () => {

    try {

        await connectDB();

        console.log("Connected");

        await User.deleteMany();

        await Doctor.deleteMany();

        await Appointment.deleteMany();

        await Review.deleteMany();

        console.log("Old Data Deleted");

        const users = await createUsers();

        console.log("Users Created");

        const doctors = await createDoctors(users);

        console.log("Doctors Created");

        const appointments = await createAppointments(

            users,

            doctors

        );

        console.log("Appointments Created");

        await createReviews(appointments);

        console.log("Reviews Created");

        console.log("Database Seeded Successfully");

        process.exit();

    }

    catch (error) {

        console.log(error);

        process.exit(1);

    }

};

seed();
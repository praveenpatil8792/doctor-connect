const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const createUsers = async () => {

    const users = [];

    const password = await bcrypt.hash("123456", 10);

    // Doctors
    for (let i = 0; i < 5; i++) {

        users.push({

            name: `Dr. ${faker.person.fullName()}`,

            email: `doctor${i + 1}@gmail.com`,

            password,

            role: "doctor",

            phone: faker.string.numeric(10)

        });

    }

    // Patients
    for (let i = 0; i < 10; i++) {

        users.push({

            name: faker.person.fullName(),

            email: `patient${i + 1}@gmail.com`,

            password,

            role: "patient",

            phone: faker.string.numeric(10)

        });

    }

    return await User.insertMany(users);

};

module.exports = createUsers;
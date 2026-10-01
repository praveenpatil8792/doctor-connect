const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Doctor Connect API",
        description: "API Documentation for Doctor Connect"
    },
    host: "localhost:5000",
    schemes: ["http"],
    securityDefinitions: {
        BearerAuth: {
            type: "apiKey",
            in: "header",
            name: "Authorization",
            description: "Enter: Bearer <JWT_TOKEN>"
        }
    }
};

const outputFile = "./swagger-output.json";

const endpointsFiles = [
    "./server.js"
];

swaggerAutogen(outputFile, endpointsFiles, doc);
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({

    cloudinary,

    params: async (req, file) => ({

        folder: "doctor-connect/profile-images",

        allowed_formats: ["jpg", "jpeg", "png"],

        transformation: [

            {
                width: 400,
                height: 400,
                crop: "fill",
                gravity: "face"
            }
        ]

    })

});

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.mimetype)) {

        return cb(
            new Error("Only JPG, JPEG and PNG images are allowed"),
            false
        );

    }

    cb(null, true);

};

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 2 * 1024 * 1024

    }

});

module.exports = upload;
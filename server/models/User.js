const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        ROLES.PATIENT,
        ROLES.DOCTOR,
        ROLES.ADMIN
      ],
      default: ROLES.PATIENT,
    },

    phone: {
      type: String,
    },

    profileImage: {
        url: {
            type: String,
            default: ""
        },
        public_id: {
            type: String,
            default: ""
        }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
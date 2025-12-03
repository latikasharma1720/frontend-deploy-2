/* eslint-disable */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
  type: String,
  enum: ["user", "admin", "student", "rider"],
  default: "user",
},
  studentId: String,
  phone: String,
  resetToken: String,
  resetTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // 🔁 NEW: returning-user tracking
  lastLoginAt: {
    type: Date,
  },

  loginCount: {
    type: Number,
    default: 0,
  },

  loginHistory: [
    {
      loggedInAt: { type: Date, default: Date.now },
      ip: String,
      userAgent: String,
    },
  ],
});

// IMPORTANT: keep the collection name "ga_users"
module.exports = mongoose.model("User", UserSchema, "ga_users");

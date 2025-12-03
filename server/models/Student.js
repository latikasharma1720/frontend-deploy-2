/* eslint-disable */
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  studentId: { type: String, required: true, unique: true },

  phone: { type: String },

  major: { type: String },

  status: {
    type: String,
    enum: ["active", "inactive", "graduated"],
    default: "active",
  },

  enrolledAt: { type: Date, default: Date.now },

  updatedAt: { type: Date },
});

// Keep collection name explicit to match project convention
module.exports = mongoose.model("Student", StudentSchema, "ga_students");

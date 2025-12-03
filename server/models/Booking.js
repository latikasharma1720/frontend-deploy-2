/* eslint-disable */
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  // Link to student/user
  studentId: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String },

  // Ride details
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  
  // Date and time
  rideDate: { type: String, required: true },
  rideTime: { type: String, required: true },
  
  // Booking details
  passengers: { type: Number, default: 1 },
  vehicleType: { 
    type: String, 
    enum: ["economy", "premium", "xl"],
    default: "economy"
  },
  
  // Fare and payment
  estimatedFare: { type: Number },
  actualFare: { type: Number },
  paymentMethod: { type: String },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },

  // Booking status
  status: {
    type: String,
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
    default: "pending"
  },

  // Driver details (optional, for future use)
  driverId: { type: String },
  driverName: { type: String },
  vehicleNumber: { type: String },

  // Additional info
  pickupNotes: { type: String },
  accessibilityNeeds: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Cancellation reason
  cancellationReason: { type: String },
});

module.exports = mongoose.model("Booking", BookingSchema, "ga_bookings");

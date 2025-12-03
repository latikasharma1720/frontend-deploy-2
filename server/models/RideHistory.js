/* eslint-disable */
const mongoose = require("mongoose");

const RideHistorySchema = new mongoose.Schema({
  // Link to booking
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  
  // Link to student/user
  studentId: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentName: { type: String },

  // Ride details (denormalized for quick access)
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  rideDate: { type: String, required: true },
  rideTime: { type: String },
  
  // Fare details
  fare: { type: Number, required: true },
  paymentMethod: { type: String },
  
  // Completion details
  status: {
    type: String,
    enum: ["completed", "cancelled"],
    required: true
  },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Driver details
  driverId: { type: String },
  driverName: { type: String },
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  
  // Rating and feedback
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  ratedAt: { type: Date },
  
  // Trip details
  distance: { type: Number }, // in miles
  duration: { type: Number }, // in minutes
  
  // Destination type
  destination: {
    type: String,
    enum: ["on-campus", "off-campus"],
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RideHistory", RideHistorySchema, "ga_ride_history");

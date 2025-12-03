const express = require("express");
const Booking = require("../models/Booking");
const RideHistory = require("../models/RideHistory");

const router = express.Router();

/**
 * POST /api/booking
 * Create a new booking
 */
router.post("/", async (req, res) => {
  try {
    console.log("=== BOOKING REQUEST RECEIVED ===");
    console.log("Request body:", req.body);
    
    const {
      studentId,
      studentEmail,
      studentName,
      pickup,
      dropoff,
      rideDate,
      rideTime,
      passengers,
      vehicleType,
      estimatedFare,
      paymentMethod,
      pickupNotes,
      accessibilityNeeds,
    } = req.body;

    if (!studentId || !studentEmail || !pickup || !dropoff || !rideDate || !rideTime) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        error: "Missing required fields: studentId, studentEmail, pickup, dropoff, rideDate, rideTime" 
      });
    }

    const booking = await Booking.create({
      studentId,
      studentEmail,
      studentName,
      pickup,
      dropoff,
      rideDate,
      rideTime,
      passengers: passengers || 1,
      vehicleType: vehicleType || "economy",
      estimatedFare,
      paymentMethod,
      pickupNotes,
      accessibilityNeeds,
      status: "confirmed",
      paymentStatus: "completed",
    });

    console.log("=== BOOKING CREATED SUCCESSFULLY ===");
    console.log("Booking ID:", booking._id);

    return res.status(201).json({ 
      message: "Booking created successfully", 
      booking 
    });
  } catch (err) {
    console.error("[booking:create]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/booking/student/:studentId
 * Get all bookings for a specific student
 */
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query; // optional filter by status

    const query = { studentId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch (err) {
    console.error("[booking:list-by-student]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/booking/:id
 * Get a specific booking by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    return res.json({ booking });
  } catch (err) {
    console.error("[booking:get]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/booking/:id
 * Update booking status or details
 */
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    updates.updatedAt = new Date();

    // If status is being changed to completed, record timestamp
    if (updates.status === "completed") {
      updates.completedAt = new Date();
    }
    
    // If status is being changed to cancelled, record timestamp
    if (updates.status === "cancelled") {
      updates.cancelledAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // If booking is completed or cancelled, create ride history entry
    if (updates.status === "completed" || updates.status === "cancelled") {
      const historyExists = await RideHistory.findOne({ bookingId: booking._id });
      
      if (!historyExists) {
        await RideHistory.create({
          bookingId: booking._id,
          studentId: booking.studentId,
          studentEmail: booking.studentEmail,
          studentName: booking.studentName,
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          rideDate: booking.rideDate,
          rideTime: booking.rideTime,
          fare: booking.actualFare || booking.estimatedFare,
          paymentMethod: booking.paymentMethod,
          status: updates.status,
          completedAt: updates.status === "completed" ? new Date() : null,
          cancelledAt: updates.status === "cancelled" ? new Date() : null,
          driverId: booking.driverId,
          driverName: booking.driverName,
          vehicleType: booking.vehicleType,
          vehicleNumber: booking.vehicleNumber,
        });
      }
    }

    return res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error("[booking:update]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/booking/:id
 * Cancel/delete a booking
 */
router.delete("/:id", async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("[booking:delete]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

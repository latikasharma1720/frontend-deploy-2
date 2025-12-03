/* eslint-disable */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Booking = require("../models/Booking");
const RideHistory = require("../models/RideHistory");
const Student = require("../models/Student");

describe("Booking & Ride History API", () => {
  let testStudent;

  // Setup: Create a test student before tests
  beforeAll(async () => {
    await Student.deleteMany({});
    testStudent = await Student.create({
      name: "Test Student",
      email: "test@pfw.edu",
      studentId: "TEST123",
    });
  });

  // Clean bookings and ride history before each test
  beforeEach(async () => {
    await Booking.deleteMany({});
    await RideHistory.deleteMany({});
  });

  // After all tests, close the connection
  afterAll(async () => {
    await Student.deleteMany({});
    await mongoose.connection.close();
  });

  // ----------------------------
  // CREATE BOOKING TESTS
  // ----------------------------
  describe("POST /api/booking", () => {
    test("Should create a new booking with valid data", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          studentName: testStudent.name,
          pickup: "Campus Center",
          dropoff: "Jefferson Pointe Mall",
          rideDate: "2025-11-30",
          rideTime: "14:00",
          passengers: 2,
          vehicleType: "economy",
          estimatedFare: 15.50,
          paymentMethod: "Card",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Booking created successfully");
      expect(res.body.booking).toBeDefined();
      expect(res.body.booking.status).toBe("confirmed");
      expect(res.body.booking.paymentStatus).toBe("completed");
      expect(res.body.booking.pickup).toBe("Campus Center");
      expect(res.body.booking.dropoff).toBe("Jefferson Pointe Mall");
    });

    test("Should reject booking without required fields", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          // missing pickup, dropoff, date, time
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Missing required fields");
    });

    test("Should set default passengers to 1", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Dorm",
          dropoff: "Library",
          rideDate: "2025-11-30",
          rideTime: "10:00",
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.passengers).toBe(1);
    });

    test("Should set default vehicleType to economy", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Dorm",
          dropoff: "Library",
          rideDate: "2025-11-30",
          rideTime: "10:00",
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.vehicleType).toBe("economy");
    });

    test("Should accept different vehicle types", async () => {
      const vehicleTypes = ["economy", "premium", "xl"];

      for (const type of vehicleTypes) {
        const res = await request(app)
          .post("/api/booking")
          .send({
            studentId: testStudent.studentId,
            studentEmail: testStudent.email,
            pickup: "A",
            dropoff: "B",
            rideDate: "2025-11-30",
            rideTime: "10:00",
            vehicleType: type,
          });

        expect(res.status).toBe(201);
        expect(res.body.booking.vehicleType).toBe(type);

        await Booking.deleteMany({});
      }
    });
  });

  // ----------------------------
  // GET BOOKINGS BY STUDENT TESTS
  // ----------------------------
  describe("GET /api/booking/student/:studentId", () => {
    test("Should return all bookings for a student", async () => {
      // Create multiple bookings
      await Booking.create([
        {
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "A",
          dropoff: "B",
          rideDate: "2025-11-30",
          rideTime: "10:00",
        },
        {
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "C",
          dropoff: "D",
          rideDate: "2025-12-01",
          rideTime: "14:00",
        },
      ]);

      const res = await request(app).get(
        `/api/booking/student/${testStudent.studentId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(2);
      expect(res.body.bookings[0].rideDate).toBe("2025-12-01"); // Most recent first
    });

    test("Should filter bookings by status", async () => {
      await Booking.create([
        {
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "A",
          dropoff: "B",
          rideDate: "2025-11-30",
          rideTime: "10:00",
          status: "confirmed",
        },
        {
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "C",
          dropoff: "D",
          rideDate: "2025-12-01",
          rideTime: "14:00",
          status: "completed",
        },
      ]);

      const res = await request(app).get(
        `/api/booking/student/${testStudent.studentId}?status=completed`
      );

      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(1);
      expect(res.body.bookings[0].status).toBe("completed");
    });

    test("Should return empty array for student with no bookings", async () => {
      const res = await request(app).get("/api/booking/student/NONEXISTENT");

      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(0);
    });
  });

  // ----------------------------
  // UPDATE BOOKING TESTS
  // ----------------------------
  describe("PUT /api/booking/:id", () => {
    test("Should update booking status to completed", async () => {
      const booking = await Booking.create({
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-30",
        rideTime: "10:00",
        status: "confirmed",
      });

      const res = await request(app)
        .put(`/api/booking/${booking._id}`)
        .send({
          status: "completed",
          actualFare: 18.00,
        });

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("completed");
      expect(res.body.booking.completedAt).toBeDefined();
      expect(res.body.booking.updatedAt).toBeDefined();
    });

    test("Should create ride history when booking is completed", async () => {
      const booking = await Booking.create({
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "Campus Center",
        dropoff: "Mall",
        rideDate: "2025-11-30",
        rideTime: "10:00",
        estimatedFare: 15,
        status: "confirmed",
      });

      await request(app)
        .put(`/api/booking/${booking._id}`)
        .send({ status: "completed" });

      // Check if ride history was created
      const history = await RideHistory.findOne({ bookingId: booking._id });
      expect(history).toBeDefined();
      expect(history.status).toBe("completed");
      expect(history.studentId).toBe(testStudent.studentId);
    });

    test("Should update booking status to cancelled", async () => {
      const booking = await Booking.create({
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-30",
        rideTime: "10:00",
      });

      const res = await request(app)
        .put(`/api/booking/${booking._id}`)
        .send({ status: "cancelled" });

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("cancelled");
      expect(res.body.booking.cancelledAt).toBeDefined();
    });

    test("Should return 404 for non-existent booking", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/booking/${fakeId}`)
        .send({ status: "completed" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Booking not found");
    });
  });

  // ----------------------------
  // CANCEL BOOKING TESTS
  // ----------------------------
  describe("DELETE /api/booking/:id", () => {
    test("Should cancel booking with reason", async () => {
      const booking = await Booking.create({
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-30",
        rideTime: "10:00",
      });

      const res = await request(app)
        .delete(`/api/booking/${booking._id}`)
        .send({ cancellationReason: "Changed plans" });

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("cancelled");
      expect(res.body.booking.cancellationReason).toBe("Changed plans");
      expect(res.body.booking.cancelledAt).toBeDefined();
    });
  });

  // ----------------------------
  // RIDE HISTORY TESTS
  // ----------------------------
  describe("GET /api/ride-history/student/:studentId", () => {
    beforeEach(async () => {
      // Create some ride history
      await RideHistory.create([
        {
          bookingId: new mongoose.Types.ObjectId(),
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Campus",
          dropoff: "Mall",
          rideDate: "2025-11-25",
          fare: 12.50,
          status: "completed",
          completedAt: new Date(),
        },
        {
          bookingId: new mongoose.Types.ObjectId(),
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Dorm",
          dropoff: "Airport",
          rideDate: "2025-11-20",
          fare: 25.00,
          status: "completed",
          completedAt: new Date(),
        },
      ]);
    });

    test("Should return ride history with stats", async () => {
      const res = await request(app).get(
        `/api/ride-history/student/${testStudent.studentId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.history).toHaveLength(2);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalRides).toBe(2);
      expect(parseFloat(res.body.stats.totalSpent)).toBe(37.50);
    });

    test("Should filter ride history by status", async () => {
      await RideHistory.create({
        bookingId: new mongoose.Types.ObjectId(),
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-26",
        fare: 10,
        status: "cancelled",
        cancelledAt: new Date(),
      });

      const res = await request(app).get(
        `/api/ride-history/student/${testStudent.studentId}?status=completed`
      );

      expect(res.status).toBe(200);
      expect(res.body.history).toHaveLength(2);
      expect(res.body.stats.completedRides).toBe(2);
    });

    test("Should limit ride history results", async () => {
      const res = await request(app).get(
        `/api/ride-history/student/${testStudent.studentId}?limit=1`
      );

      expect(res.status).toBe(200);
      expect(res.body.history).toHaveLength(1);
    });
  });

  // ----------------------------
  // RATING TESTS
  // ----------------------------
  describe("POST /api/ride-history/:id/rate", () => {
    test("Should add rating and feedback to ride", async () => {
      const history = await RideHistory.create({
        bookingId: new mongoose.Types.ObjectId(),
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-25",
        fare: 12.50,
        status: "completed",
      });

      const res = await request(app)
        .post(`/api/ride-history/${history._id}/rate`)
        .send({
          rating: 5,
          feedback: "Excellent service!",
        });

      expect(res.status).toBe(200);
      expect(res.body.history.rating).toBe(5);
      expect(res.body.history.feedback).toBe("Excellent service!");
      expect(res.body.history.ratedAt).toBeDefined();
    });

    test("Should reject invalid ratings", async () => {
      const history = await RideHistory.create({
        bookingId: new mongoose.Types.ObjectId(),
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-25",
        fare: 12.50,
        status: "completed",
      });

      const res = await request(app)
        .post(`/api/ride-history/${history._id}/rate`)
        .send({
          rating: 6, // Invalid: > 5
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Rating must be between 1 and 5");
    });

    test("Should accept rating without feedback", async () => {
      const history = await RideHistory.create({
        bookingId: new mongoose.Types.ObjectId(),
        studentId: testStudent.studentId,
        studentEmail: testStudent.email,
        pickup: "A",
        dropoff: "B",
        rideDate: "2025-11-25",
        fare: 12.50,
        status: "completed",
      });

      const res = await request(app)
        .post(`/api/ride-history/${history._id}/rate`)
        .send({ rating: 4 });

      expect(res.status).toBe(200);
      expect(res.body.history.rating).toBe(4);
    });
  });

  // ----------------------------
  // PRICING & SERVICES TESTS
  // ----------------------------
  describe("Pricing Validation", () => {
    test("Should handle various fare amounts", async () => {
      const fares = [5.00, 12.50, 25.75, 100.00];

      for (const fare of fares) {
        const res = await request(app)
          .post("/api/booking")
          .send({
            studentId: testStudent.studentId,
            studentEmail: testStudent.email,
            pickup: "A",
            dropoff: "B",
            rideDate: "2025-11-30",
            rideTime: "10:00",
            estimatedFare: fare,
          });

        expect(res.status).toBe(201);
        expect(res.body.booking.estimatedFare).toBe(fare);

        await Booking.deleteMany({});
      }
    });

    test("Should calculate correct stats for pricing analytics", async () => {
      await RideHistory.create([
        {
          bookingId: new mongoose.Types.ObjectId(),
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Campus",
          dropoff: "Mall",
          rideDate: "2025-11-25",
          fare: 10.00,
          status: "completed",
        },
        {
          bookingId: new mongoose.Types.ObjectId(),
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "Dorm",
          dropoff: "Airport",
          rideDate: "2025-11-20",
          fare: 30.00,
          status: "completed",
        },
      ]);

      const res = await request(app).get(
        `/api/ride-history/student/${testStudent.studentId}`
      );

      expect(res.status).toBe(200);
      expect(parseFloat(res.body.stats.totalSpent)).toBe(40.00);
      expect(res.body.stats.totalRides).toBe(2);
    });
  });

  // ----------------------------
  // SERVICE TYPE TESTS
  // ----------------------------
  describe("Service Types & Vehicle Classes", () => {
    test("Should support economy service", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "A",
          dropoff: "B",
          rideDate: "2025-11-30",
          rideTime: "10:00",
          vehicleType: "economy",
          estimatedFare: 8.00,
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.vehicleType).toBe("economy");
    });

    test("Should support premium service", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "A",
          dropoff: "B",
          rideDate: "2025-11-30",
          rideTime: "10:00",
          vehicleType: "premium",
          estimatedFare: 16.00,
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.vehicleType).toBe("premium");
    });

    test("Should support XL service for groups", async () => {
      const res = await request(app)
        .post("/api/booking")
        .send({
          studentId: testStudent.studentId,
          studentEmail: testStudent.email,
          pickup: "A",
          dropoff: "B",
          rideDate: "2025-11-30",
          rideTime: "10:00",
          vehicleType: "xl",
          passengers: 5,
          estimatedFare: 20.00,
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.vehicleType).toBe("xl");
      expect(res.body.booking.passengers).toBe(5);
    });
  });
});

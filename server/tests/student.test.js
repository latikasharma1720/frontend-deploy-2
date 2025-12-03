/* eslint-disable */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Student = require("../models/Student");

describe("Student Database API", () => {
  // Clean the students collection before each test
  beforeEach(async () => {
    await Student.deleteMany({});
  });

  // After all tests, close the existing connection
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ----------------------------
  // CREATE STUDENT TESTS
  // ----------------------------
  describe("POST /api/student", () => {
    test("Should create a new student with valid data", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "John Doe",
          email: "john@pfw.edu",
          studentId: "PFW12345",
          phone: "555-0100",
          major: "Computer Science",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Student created");
      expect(res.body.student).toBeDefined();
      expect(res.body.student.email).toBe("john@pfw.edu");
      expect(res.body.student.studentId).toBe("PFW12345");
      expect(res.body.student.status).toBe("active");
    });

    test("Should reject student creation without required fields", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "Jane Doe",
          // missing email and studentId
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test("Should reject duplicate email", async () => {
      // Create first student
      await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
      });

      // Try to create another with same email
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "Jane Doe",
          email: "john@pfw.edu",
          studentId: "PFW67890",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already exists");
    });

    test("Should reject duplicate studentId", async () => {
      // Create first student
      await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
      });

      // Try to create another with same studentId
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "Jane Doe",
          email: "jane@pfw.edu",
          studentId: "PFW12345",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already exists");
    });
  });

  // ----------------------------
  // GET ALL STUDENTS TESTS
  // ----------------------------
  describe("GET /api/student", () => {
    test("Should return empty array when no students exist", async () => {
      const res = await request(app).get("/api/student");

      expect(res.status).toBe(200);
      expect(res.body.students).toBeDefined();
      expect(res.body.students).toHaveLength(0);
    });

    test("Should return all students sorted by enrolledAt", async () => {
      // Create students with explicit timestamps to ensure proper sorting
      const now = Date.now();
      await Student.create({
        name: "Alice",
        email: "alice@pfw.edu",
        studentId: "PFW001",
        major: "CS",
        enrolledAt: new Date(now - 2000),
      });
      
      await Student.create({
        name: "Bob",
        email: "bob@pfw.edu",
        studentId: "PFW002",
        major: "Math",
        enrolledAt: new Date(now - 1000),
      });
      
      await Student.create({
        name: "Charlie",
        email: "charlie@pfw.edu",
        studentId: "PFW003",
        major: "Physics",
        enrolledAt: new Date(now),
      });

      const res = await request(app).get("/api/student");

      expect(res.status).toBe(200);
      expect(res.body.students).toHaveLength(3);
      expect(res.body.students[0].name).toBe("Charlie"); // Most recent
    });
  });

  // ----------------------------
  // GET STUDENT BY ID TESTS
  // ----------------------------
  describe("GET /api/student/:id", () => {
    test("Should return student by valid ID", async () => {
      const student = await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
        major: "Computer Science",
      });

      const res = await request(app).get(`/api/student/${student._id}`);

      expect(res.status).toBe(200);
      expect(res.body.student).toBeDefined();
      expect(res.body.student.name).toBe("John Doe");
      expect(res.body.student.studentId).toBe("PFW12345");
    });

    test("Should return 404 for non-existent student ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/student/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Student not found");
    });

    test("Should return 500 for invalid ID format", async () => {
      const res = await request(app).get("/api/student/invalid-id");

      expect(res.status).toBe(500);
    });
  });

  // ----------------------------
  // UPDATE STUDENT TESTS
  // ----------------------------
  describe("PUT /api/student/:id", () => {
    test("Should update student information", async () => {
      const student = await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
        major: "Computer Science",
      });

      const res = await request(app)
        .put(`/api/student/${student._id}`)
        .send({
          major: "Data Science",
          phone: "555-9999",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Student updated");
      expect(res.body.student.major).toBe("Data Science");
      expect(res.body.student.phone).toBe("555-9999");
      expect(res.body.student.updatedAt).toBeDefined();
    });

    test("Should return 404 when updating non-existent student", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/student/${fakeId}`).send({
        major: "Data Science",
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Student not found");
    });

    test("Should update student status", async () => {
      const student = await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
        status: "active",
      });

      const res = await request(app)
        .put(`/api/student/${student._id}`)
        .send({
          status: "graduated",
        });

      expect(res.status).toBe(200);
      expect(res.body.student.status).toBe("graduated");
    });
  });

  // ----------------------------
  // DELETE STUDENT TESTS
  // ----------------------------
  describe("DELETE /api/student/:id", () => {
    test("Should delete student by ID", async () => {
      const student = await Student.create({
        name: "John Doe",
        email: "john@pfw.edu",
        studentId: "PFW12345",
      });

      const res = await request(app).delete(`/api/student/${student._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Student deleted");

      // Verify student is actually deleted
      const deletedStudent = await Student.findById(student._id);
      expect(deletedStudent).toBeNull();
    });

    test("Should return 404 when deleting non-existent student", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/student/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Student not found");
    });
  });

  // ----------------------------
  // STUDENT VALIDATION TESTS
  // ----------------------------
  describe("Student Data Validation", () => {
    test("Should accept valid student status values", async () => {
      const statuses = ["active", "inactive", "graduated"];

      for (const status of statuses) {
        const res = await request(app)
          .post("/api/student")
          .send({
            name: `Student ${status}`,
            email: `${status}@pfw.edu`,
            studentId: `PFW${status}`,
            status,
          });

        expect(res.status).toBe(201);
        expect(res.body.student.status).toBe(status);

        // Clean up for next iteration
        await Student.deleteMany({});
      }
    });

    test("Should store email in lowercase", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "John Doe",
          email: "JOHN@PFW.EDU",
          studentId: "PFW12345",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.email).toBe("john@pfw.edu");
    });

    test("Should set default status to active", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "John Doe",
          email: "john@pfw.edu",
          studentId: "PFW12345",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.status).toBe("active");
    });

    test("Should set enrolledAt timestamp automatically", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "John Doe",
          email: "john@pfw.edu",
          studentId: "PFW12345",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.enrolledAt).toBeDefined();
      expect(new Date(res.body.student.enrolledAt)).toBeInstanceOf(Date);
    });
  });

  // ----------------------------
  // EDGE CASE TESTS
  // ----------------------------
  describe("Edge Cases", () => {
    test("Should handle student with all optional fields", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "Jane Doe",
          email: "jane@pfw.edu",
          studentId: "PFW99999",
          phone: "555-1234",
          major: "Biology",
          status: "active",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.phone).toBe("555-1234");
      expect(res.body.student.major).toBe("Biology");
    });

    test("Should handle student with only required fields", async () => {
      const res = await request(app)
        .post("/api/student")
        .send({
          name: "John Minimal",
          email: "minimal@pfw.edu",
          studentId: "PFWMIN",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.name).toBe("John Minimal");
      expect(res.body.student.phone).toBeUndefined();
      expect(res.body.student.major).toBeUndefined();
    });

    test("Should handle very long names", async () => {
      const longName = "A".repeat(100);
      const res = await request(app)
        .post("/api/student")
        .send({
          name: longName,
          email: "long@pfw.edu",
          studentId: "PFWLONG",
        });

      expect(res.status).toBe(201);
      expect(res.body.student.name).toBe(longName);
    });
  });
});

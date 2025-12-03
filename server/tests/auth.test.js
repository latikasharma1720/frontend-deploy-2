/* eslint-disable */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

describe("Guest User Auth API", () => {
  /**
   * IMPORTANT:
   * - server.js already calls mongoose.connect(...)
   * - so we DO NOT call mongoose.connect() here
   *   (otherwise we get the "openUri on active connection" error)
   */

  // Clean the users collection before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // After all tests, close the existing connection
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ----------------------------
  // SIGNUP TESTS
  // ----------------------------
  test("User signup succeeds with @pfw.edu email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "latika@pfw.edu",
        password: "mypassword123",
      });

    expect(res.status).toBe(201);
    // match your backend message
    expect(res.body.message).toBe("Student account created successfully");
    expect(res.body.userId).toBeDefined();
  });

  test("Signup should reject non-pfw.edu email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "latika@gmail.com",
        password: "mypassword123",
      });

    expect(res.status).toBe(400);
    // match your backend error
    expect(res.body.error).toBe("Use @pfw.edu or @purdue.edu email");
  });

  test("Signup should reject short password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "latika@pfw.edu",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password must be 8+ characters");
  });

  test("Signup should reject duplicate email", async () => {
    await User.create({
      name: "latika",
      email: "latika@pfw.edu",
      password: "hashedpassword",
      role: "user",
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "latika@pfw.edu",
        password: "mypassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email already registered");
  });

  // ----------------------------
  // LOGIN TESTS
  // ----------------------------
  test("Login succeeds with correct credentials", async () => {
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash("mypassword123", 10);

    await User.create({
      name: "latika",
      email: "latika@pfw.edu",
      password: hashed,
      role: "user",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "latika@pfw.edu",
        password: "mypassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user.email).toBe("latika@pfw.edu");
  });

  test("Login fails when email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@pfw.edu",
        password: "password123",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  test("Login fails with wrong password", async () => {
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash("correctpassword", 10);

    await User.create({
      name: "latika",
      email: "latika@pfw.edu",
      password: hashed,
      role: "user",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "latika@pfw.edu",
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  // ----------------------------
  // FORGOT PASSWORD
  // ----------------------------
  test("Forgot-password returns generic message always", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "noone@pfw.edu",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("reset link has been created");
  });

  // ----------------------------
  // RESET PASSWORD
  // ----------------------------
  test("Reset password should reject invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "fake-token",
        newPassword: "newpassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid or expired reset token.");
  });
});

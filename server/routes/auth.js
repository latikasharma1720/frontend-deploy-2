const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // built-in Node module
const User = require("../models/User");
const Student = require("../models/Student");

const router = express.Router();

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req, res) => {
  try {
    console.log("=== SIGNUP REQUEST RECEIVED ===");
    console.log("Request body:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password required" });
    }

    const emailLower = email.toLowerCase();
    const isStudentDomain =
      emailLower.endsWith("@pfw.edu") || emailLower.endsWith("@purdue.edu");

    if (!isStudentDomain) {
      console.log("Invalid email domain");
      return res.status(400).json({ error: "Use @pfw.edu or @purdue.edu email" });
    }

    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      console.log("Email already exists");
      return res.status(400).json({ error: "Email already registered" });
    }

    if (password.length < 8) {
      console.log("Password too short");
      return res.status(400).json({ error: "Password must be 8+ characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = req.body.name || emailLower.split("@")[0];

    // Generate studentId from email if not provided
    const providedStudentId = req.body.studentId || emailLower.split("@")[0];
    const phone = req.body.phone;
    const major = req.body.major;

    // Check if student already exists in students collection
    const existingStudent = await Student.findOne({
      $or: [{ email: emailLower }, { studentId: providedStudentId }],
    });
    if (existingStudent) {
      console.log("Student already exists in students collection");
      return res.status(400).json({ error: "Student already registered" });
    }

    // Create Student record first
    const student = await Student.create({
      name,
      email: emailLower,
      studentId: providedStudentId,
      phone,
      major,
    });

    // Create User record with role=student
    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role: "student",
      studentId: student.studentId,
    });

    console.log("=== STUDENT USER CREATED SUCCESSFULLY ===");
    console.log("User ID:", newUser._id);
    console.log("Student ID:", student._id);

    return res.status(201).json({
      message: "Student account created successfully",
      userId: newUser._id,
      role: newUser.role,
      studentId: student.studentId,
    });
  } catch (err) {
    console.error("=== SIGNUP ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * Returning users
 */
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST RECEIVED ===");
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res
        .status(400)
        .json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🔁 update returning-user fields
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.loginHistory.push({
      loggedInAt: new Date(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await user.save();

    // If this is a student user, also fetch student profile
    let studentProfile = null;
    if (user.role === "student") {
      try {
        studentProfile = await Student.findOne({ email: user.email.toLowerCase() }).lean();
      } catch (e) {
        console.error("[login] Failed to fetch student profile:", e);
      }
    }

    console.log("=== LOGIN SUCCESS ===", {
      email: user.email,
      loginCount: user.loginCount,
      role: user.role,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
      },
      student: studentProfile,
    });
  } catch (err) {
    console.error("=== LOGIN ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🔐 POST /api/auth/forgot-password
 * Store reset token + expiry when user says "I forgot my password"
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security: respond the same whether or not the user exists
      return res.json({
        message:
          "If an account exists with that email, a reset link has been created.",
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.save();

    console.log("=== PASSWORD RESET TOKEN GENERATED ===");
    console.log("Email:", user.email);
    console.log("Token:", token);
    console.log("Expires:", user.resetTokenExpiry);

    // In a real app we'd email this token.
    // For your project, we return it so you can show/log it.
    return res.json({
      message:
        "If an account exists with that email, a reset link has been created.",
      resetToken: token,
      expiresAt: user.resetTokenExpiry,
    });
  } catch (err) {
    console.error("=== FORGOT PASSWORD ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🔐 POST /api/auth/reset-password
 * Use token + new password to actually change the password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required." });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset token." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    console.log("=== PASSWORD RESET SUCCESS ===", user.email);

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("=== RESET PASSWORD ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

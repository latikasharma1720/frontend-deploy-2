// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS
app.use(
  cors({
    origin:[

     "http://localhost:3000",
    "https://mastoridedeploy.vercel.app",
    ],
  })
);

// JSON body parser
app.use(express.json());

console.log("Starting server...");

// MongoDB connect
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/mastoride";
if (!process.env.MONGO_URL) {
  console.warn("Warning: MONGO_URL not set — using fallback:", mongoUrl);
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const studentRoutes = require("./routes/student");
app.use("/api/student", studentRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/api/booking", bookingRoutes);

const rideHistoryRoutes = require("./routes/rideHistory");
app.use("/api/ride-history", rideHistoryRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Test routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Only start server if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = 5001;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// VERY IMPORTANT: Export app for testing
module.exports = app;

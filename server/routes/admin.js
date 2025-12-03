const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");

const router = express.Router();


/**
 * GET /api/admin/users
 * Fetch all users (admin only)
 */
router.get("/users", async (req, res) => {
  try {
    console.log("=== FETCH USERS REQUEST RECEIVED ===");

    // Fetch all users, sorted by creation date (newest first)
    const users = await User.find({})
      .select("-password -resetToken -resetTokenExpiry") // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent users

    console.log(`Found ${users.length} users`);

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      joined: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      status: user.lastLoginAt ? 'Active' : 'Inactive',
      role: user.role,
      studentId: user.studentId,
      phone: user.phone,
      loginCount: user.loginCount || 0,
      lastLoginAt: user.lastLoginAt
    }));

    return res.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    });
  } catch (err) {
    console.error("=== FETCH USERS ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete a user by ID (admin only)
 */
router.delete("/users/:userId", async (req, res) => {
  try {
    console.log("=== DELETE USER REQUEST RECEIVED ===");
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);

    console.log(`User deleted: ${user.email}`);

    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("=== DELETE USER ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/ride-types
 * Get ride type distribution statistics
 */
router.get("/ride-types", async (req, res) => {
  try {
    console.log("=== FETCH RIDE TYPES REQUEST RECEIVED ===");

    // Aggregate bookings by vehicle type
    const rideTypes = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["completed", "confirmed", "in-progress"] }
        }
      },
      {
        $group: {
          _id: "$vehicleType",
          count: { $sum: 1 }
        }
      }
    ]);

    // Define all possible ride types with their display properties
    const typeMap = {
      economy: { label: "Economy", color: "#3B82F6", count: 0 },
      premium: { label: "Premium", color: "#F59E0B", count: 0 },
      xl: { label: "XL", color: "#10B981", count: 0 },
      shared: { label: "Shared", color: "#EF4444", count: 0 }
    };

    // Update counts from aggregation results
    rideTypes.forEach(item => {
      const typeKey = item._id?.toLowerCase() || "economy";
      if (typeMap[typeKey]) {
        typeMap[typeKey].count = item.count;
      }
    });

    // Build arrays for response - always include all types
    const labels = [];
    const data = [];
    const colors = [];

    // Add all ride types in order, including those with 0 rides
    Object.keys(typeMap).forEach(key => {
      const type = typeMap[key];
      labels.push(type.label);
      data.push(type.count);
      colors.push(type.color);
    });

    console.log(`Ride type distribution calculated: ${labels.length} types`);

    return res.json({
      success: true,
      labels,
      data,
      colors
    });
  } catch (err) {
    console.error("=== FETCH RIDE TYPES ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/monthly-rides
 * Get monthly ride statistics for the past 12 months
 */
router.get("/monthly-rides", async (req, res) => {
  try {
    console.log("=== FETCH MONTHLY RIDES REQUEST RECEIVED ===");

    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // Initialize array for 12 months of data
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate data for each of the past 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      
      // Create date range for this month (as strings in YYYY-MM-DD format)
      const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Count rides using rideDate field (string comparison)
      const count = await Booking.countDocuments({
        rideDate: { $gte: startDateStr, $lte: endDateStr },
        status: { $in: ["completed", "confirmed", "in-progress"] }
      });

      monthlyData.push({
        month: monthNames[month],
        year: year,
        count: count
      });
    }

    console.log(`Monthly ride data calculated for 12 months`);

    return res.json({
      success: true,
      data: monthlyData,
      labels: monthlyData.map(m => m.month),
      counts: monthlyData.map(m => m.count)
    });
  } catch (err) {
    console.error("=== FETCH MONTHLY RIDES ERROR ===");
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

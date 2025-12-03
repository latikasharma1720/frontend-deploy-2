const express = require("express");
const RideHistory = require("../models/RideHistory");

const router = express.Router();

/**
 * GET /api/ride-history/student/:studentId
 * Get ride history for a specific student
 */
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, startDate, endDate, limit } = req.query;

    const query = { studentId };

    // Filter by status (completed/cancelled)
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let historyQuery = RideHistory.find(query)
      .sort({ createdAt: -1 })
      .populate("bookingId", "pickup dropoff rideDate");

    // Limit results if specified
    if (limit) {
      historyQuery = historyQuery.limit(parseInt(limit));
    }

    const history = await historyQuery;

    // Calculate stats
    const stats = {
      totalRides: history.length,
      completedRides: history.filter(h => h.status === "completed").length,
      cancelledRides: history.filter(h => h.status === "cancelled").length,
      totalSpent: history
        .filter(h => h.status === "completed")
        .reduce((sum, h) => sum + (h.fare || 0), 0)
        .toFixed(2),
      averageRating: history.filter(h => h.rating).length > 0
        ? (history.reduce((sum, h) => sum + (h.rating || 0), 0) / history.filter(h => h.rating).length).toFixed(1)
        : null,
    };

    return res.json({ history, stats });
  } catch (err) {
    console.error("[ride-history:list]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/ride-history/:id
 * Get specific ride history entry
 */
router.get("/:id", async (req, res) => {
  try {
    const history = await RideHistory.findById(req.params.id).populate("bookingId");
    if (!history) {
      return res.status(404).json({ error: "Ride history not found" });
    }
    return res.json({ history });
  } catch (err) {
    console.error("[ride-history:get]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/ride-history/:id/rate
 * Add rating and feedback to a ride
 */
router.post("/:id/rate", async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const history = await RideHistory.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        feedback,
        ratedAt: new Date(),
      },
      { new: true }
    );

    if (!history) {
      return res.status(404).json({ error: "Ride history not found" });
    }

    return res.json({ message: "Rating submitted", history });
  } catch (err) {
    console.error("[ride-history:rate]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/ride-history/student/:studentId/stats
 * Get detailed statistics for a student
 */
router.get("/student/:studentId/stats", async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await RideHistory.find({ studentId });

    const stats = {
      totalRides: history.length,
      completedRides: history.filter(h => h.status === "completed").length,
      cancelledRides: history.filter(h => h.status === "cancelled").length,
      totalSpent: history
        .filter(h => h.status === "completed")
        .reduce((sum, h) => sum + (h.fare || 0), 0)
        .toFixed(2),
      averageRating: history.filter(h => h.rating).length > 0
        ? (history.reduce((sum, h) => sum + (h.rating || 0), 0) / history.filter(h => h.rating).length).toFixed(1)
        : null,
      totalDistance: history.reduce((sum, h) => sum + (h.distance || 0), 0).toFixed(1),
      totalDuration: history.reduce((sum, h) => sum + (h.duration || 0), 0),
      favoritePickup: getMostFrequent(history.map(h => h.pickup)),
      favoriteDropoff: getMostFrequent(history.map(h => h.dropoff)),
      onCampusRides: history.filter(h => h.destination === "on-campus").length,
      offCampusRides: history.filter(h => h.destination === "off-campus").length,
    };

    return res.json({ stats });
  } catch (err) {
    console.error("[ride-history:stats]", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Helper function to find most frequent item in array
function getMostFrequent(arr) {
  if (arr.length === 0) return null;
  const frequency = {};
  let maxFreq = 0;
  let mostFrequent = null;

  arr.forEach(item => {
    if (!item) return;
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mostFrequent = item;
    }
  });

  return mostFrequent;
}

module.exports = router;

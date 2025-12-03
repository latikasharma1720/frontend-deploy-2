import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getUser } from "../../utils/session";

export default function BookRide() {
  const user = getUser();
  const [ride, setRide] = useState({
    pickup: "",
    dropoff: "",
    date: "",
    time: "",
    passengers: 1,
  });

  const [fare, setFare] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState("");

  // Calculate simple fare dynamically
  const handleEstimateFare = (e) => {
    e.preventDefault();
    const baseFare = 3.5;
    const distance = Math.floor(Math.random() * 10) + 1; // mock distance 1–10 mi
    const total = (baseFare + distance * 1.75) * ride.passengers;
    setFare(total.toFixed(2));
  };

  const handleBookRide = async (e) => {
    e.preventDefault();
    
    if (!ride.pickup || !ride.dropoff || !ride.date || !ride.time) {
      setConfirmMsg("❌ Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user?.email?.split("@")[0] || "student",
          studentEmail: user?.email || "",
          studentName: user?.name || "",
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          rideDate: ride.date,
          rideTime: ride.time,
          passengers: ride.passengers,
          vehicleType: "economy",
          estimatedFare: fare ? parseFloat(fare) : 0,
          paymentMethod: "Visa Card",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmMsg(
          `✅ Ride confirmed for ${ride.date} at ${ride.time} from ${ride.pickup} to ${ride.dropoff}. Booking ID: ${data.booking._id}`
        );
      } else {
        setConfirmMsg(`❌ ${data.error || "Booking failed"}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setConfirmMsg("❌ Cannot connect to server. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="bookride-page">
        <div className="bookride-card">
          <h2>Book a Ride 🚗</h2>
          <p>Plan your next ride easily and estimate your fare instantly.</p>

          <form className="bookride-form">
            {/* Pickup */}
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                placeholder="Enter pickup location"
                value={ride.pickup}
                onChange={(e) => setRide({ ...ride, pickup: e.target.value })}
                required
              />
            </div>

            {/* Drop-off */}
            <div className="form-group">
              <label>Drop-off Location</label>
              <input
                type="text"
                placeholder="Enter drop-off location"
                value={ride.dropoff}
                onChange={(e) => setRide({ ...ride, dropoff: e.target.value })}
                required
              />
            </div>

            {/* Date and Time */}
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={ride.date}
                  onChange={(e) => setRide({ ...ride, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={ride.time}
                  onChange={(e) => setRide({ ...ride, time: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="form-group">
              <label>Passengers</label>
              <input
                type="number"
                min="1"
                max="4"
                value={ride.passengers}
                onChange={(e) =>
                  setRide({ ...ride, passengers: parseInt(e.target.value) })
                }
              />
            </div>

            {/* Estimate Fare button with fare inside */}
            <div
              className="button-row"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button
                onClick={handleEstimateFare}
                className="btn-estimate"
                style={{
                  background: "linear-gradient(180deg, #fff3cd, #ffd966)",
                  border: "1px solid #f0c24d",
                  borderRadius: "10px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                }}
              >
                {fare ? `💵 Estimated Fare: $${fare}` : "Estimate Fare"}
              </button>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleBookRide}
              className="btn-book"
              style={{
                marginTop: "20px",
                background: "linear-gradient(180deg, #ffda79, #f8c146)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontWeight: "600",
                color: "#3c2f00",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Confirm Booking
            </button>
          </form>

          {/* Confirmation message */}
          {confirmMsg && (
            <div
              className="confirm-msg"
              style={{
                marginTop: "20px",
                background: "#e6ffed",
                border: "1px solid #b3e6be",
                color: "#035e2a",
                padding: "12px 18px",
                borderRadius: "12px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {confirmMsg}
              <br />
              A confirmation email will be sent to{" "}
              <strong>{user?.email}</strong>.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    const trimmed = email.trim();

    // Simple validation
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!trimmed.endsWith("@pfw.edu")) {
      setError("Please use your @pfw.edu email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // For demo: log token to console (so you can manually test reset)
      if (data.resetToken) {
        console.log("Reset token for testing:", data.resetToken);
      }

      setMsg(
        data.message ||
          `If an account exists for ${trimmed}, a reset link has been created.`
      );
      setEmail("");
    } catch (err) {
      console.error("Forgot password request error:", err);
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="signup-pull-scene">
        {/* Illustration */}
        <div className="pull-vehicle">
          <img
            src="/assets/images/ForgotPassword.png"
            alt="Forgot Password illustration"
            className="pull-vehicle-img"
          />
        </div>

        {/* Form */}
        <section className="pull-form">
          {/* Success Message */}
          {msg && (
            <div className="success-message-banner">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {msg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-text" style={{ marginBottom: "0.75rem" }}>
              {error}
            </div>
          )}

          <h1>Reset Password</h1>
          <p className="pull-sub">
            Enter your PFW email to receive a reset link.
          </p>

          <form
            className="pull-form-inner"
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <div className="sg-field">
              <label htmlFor="email">PFW Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pfw.edu"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="signup-cta"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="signup-login">
            Remember your password? <Link to="/login">Back to login</Link>
          </p>
        </section>
      </main>
    </>
  );
}

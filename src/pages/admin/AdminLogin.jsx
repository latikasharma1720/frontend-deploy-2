// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { setUser, getUser } from "../../utils/session";
import Navbar from "../../components/Navbar";

export default function AdminLogin() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState("");

  // Already logged in as admin? -> go to dashboard
  if (currentUser && currentUser.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");

    const emailLower = email.trim().toLowerCase();

    // Demo credentials — change later when you wire a real backend
    if (emailLower === "admin@mastoride.edu" && password === "Admin#123") {
      setUser({
        id: "admin1",
        name: "Administrator",
        email: emailLower,
        role: "admin",
      });
      navigate("/admin", { replace: true });
    } else {
      setErr("Invalid email or password.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-login-page">
        {/* Split layout: video left, form right */}
        <div className="admin-login-split">
          {/* LEFT SIDE - Video Background Panel */}
          <div className="admin-video-panel">
            {/* Background Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="admin-background-video"
            >
              <source src="/assets/images/Loginvideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Content on top of video */}
            <div className="admin-video-content">
            </div>
          </div>

          {/* RIGHT SIDE - Login Form */}
          <div className="admin-form-panel">
            <div className="admin-form-container">
              {/* Error banner */}
              {err && (
                <div className="error-banner">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {err}
                </div>
              )}

              {/* Login Card */}
              <div className="admin-login-card">
                {/* Header */}
                <div className="admin-login-header">
                  <h1 className="admin-brand">
                  </h1>
                  <p className="admin-subtitle">Login to connect to the dashboard</p>
                </div>

                {/* Form */}
                <form className="admin-login-form" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="admin-field">
                    <label htmlFor="admin-email">Email</label>
                    <div className="input-with-icon">
                      <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@mastoride.edu"
                        autoComplete="username"
                        required
                      />
                      <span className="input-icon">@</span>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="admin-field">
                    <label htmlFor="admin-password">Password</label>
                    <div className="input-with-icon">
                      <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                      />
                      <span className="input-icon">🔒</span>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="admin-remember-wrapper">
                    <label className="admin-remember">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="admin-login-btn">
                    <span>→</span> Continue
                  </button>

                  {/* Help text */}
                  <div className="admin-help-text">
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
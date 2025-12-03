import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { setUser } from "../utils/session";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Enter a valid email.";
    }
    if (!password) {
      errs.password = "Enter your password.";
    }

    setErrors(errs);

    if (Object.keys(errs).length !== 0) {
      return;
    }

    const emailLower = email.trim().toLowerCase();

    // ✅ KEEP EXISTING ADMIN SHORTCUT
    if (emailLower === "admin@mastoride.app") {
      setUser({
        id: "a1",
        name: "Admin",
        email: "admin@mastoride.app",
        role: "admin",
      });
      navigate("/admin/profile", { replace: true });
      return;
    }

    // ✅ Normal users → talk to backend
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailLower,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ api: data.error || "Login failed" });
        return;
      }

      // Save user from DB into session
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        lastLoginAt: data.user.lastLoginAt,
        loginCount: data.user.loginCount,
      });

      if (data.user.role === "admin") {
        navigate("/admin/profile", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login request error:", error);
      setErrors({
        api: "Cannot connect to server. Make sure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="modern-login-page">
        <div className="modern-login-layout">
          {/* Left animated image */}
          <div className="login-image-container">
            <img
              src="/assets/images/Login Graphic.png"
              alt="Boy pointing at login form"
              className="login-illustration"
            />
          </div>

          {/* Right: login container */}
          <div className="modern-login-container">
            {/* Success Message */}
            {successMsg && (
              <div className="success-banner">
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
                {successMsg}
              </div>
            )}

            {/* Login Card */}
            <div className="modern-login-card">
              <div className="login-header">
                <h1 className="split-heading">
                  <span className="split-word-first">Member</span>
                  <span className="split-word-second">Login</span>
                </h1>
              </div>

              {/* Form */}
              <form className="modern-login-form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="modern-field">
                  <label htmlFor="email">PFW Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pfw.edu"
                    className={errors.email ? "error" : ""}
                    disabled={loading}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                {/* Password Field */}
                <div className="modern-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={errors.password ? "error" : ""}
                    disabled={loading}
                  />
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                {/* API Error */}
                {errors.api && (
                  <div className="error-text" style={{ marginBottom: "0.75rem" }}>
                    {errors.api}
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="login-options">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Lost your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="modern-login-btn"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                {/* Sign Up Link */}
                <div className="signup-prompt">
                  Not a member? <Link to="/signup">Register today</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

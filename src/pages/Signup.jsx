import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
    if (!email.endsWith("@pfw.edu")) errs.email = "Please use your @pfw.edu email";
    if (!password || password.length < 8) errs.password = "Minimum 8 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";

    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);

      try {
        const response = await fetch("http://localhost:5001/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("✅ Account created successfully! User ID: " + data.userId);
          navigate("/login", {
            state: { message: "Account created! Please log in." },
          });
        } else {
          setErrors({ api: data.error || "Signup failed" });
        }
      } catch (error) {
        console.error("Signup request error:", error); // 👈 extra debug info
        setErrors({
          api: "Cannot connect to server. Make sure backend is running.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Navbar />

      <main className="signup-pull-scene">
        <div className="pull-vehicle">
          <img
            src="/assets/images/Signup Graphic.png"
            alt="Signup taxi bringing the form"
            className="pull-vehicle-img"
          />
        </div>

        <section className="pull-form">
          <h1>Create your account</h1>
          <p className="pull-sub">
            It&apos;s quick and easy — exclusive to PFW students.
          </p>

          <form
            className="pull-form-inner"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="sg-field">
              <label>PFW Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pfw.edu"
                className={errors.email ? "error" : ""}
                disabled={loading}
              />
              {errors.email && (
                <span className="sg-error">{errors.email}</span>
              )}
            </div>

            <div className="sg-field">
              <label>Create password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                className={errors.password ? "error" : ""}
                disabled={loading}
              />
            {errors.password && (
                <span className="sg-error">{errors.password}</span>
              )}
            </div>

            <div className="sg-field">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className={errors.confirm ? "error" : ""}
                disabled={loading}
              />
              {errors.confirm && (
                <span className="sg-error">{errors.confirm}</span>
              )}
            </div>

            {errors.api && <span className="sg-error">{errors.api}</span>}

            <button type="submit" className="signup-cta" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="signup-login">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </section>
      </main>
    </>
  );
}

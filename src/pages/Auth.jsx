import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QRDownload from "../../components/QRDownload";
import { setUser } from "../../utils/session";
import { isPfwEmail, isStrongPassword } from "../../utils/validation";

/**
 * Unified Auth screen with 2 tabs:
 * - Sign up: creates a USER account (PFW email required), then redirects to /login with a success message
 * - Log in: accepts USER login (any email) OR the single ADMIN account
 *
 * Uses ONLY session.js (setUser), NO adminAuth.
 *
 * Admin credentials:
 *   Email: admin@mastoride.edu
 *   Password: Admin#123
 */
export default function Auth({ initialTab = "signup" }) {
  const signupRadio = useRef(null);
  const loginRadio  = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Success message from redirect (e.g., after sign up)
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");

  useEffect(() => {
    if (initialTab === "login") loginRadio.current.checked = true;
    else signupRadio.current.checked = true;

    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(t);
    }
  }, [initialTab, successMsg]);

  /* ----------------------- Sign Up state ----------------------- */
  const [suEmail, setSuEmail] = useState("");
  const [suPw, setSuPw]       = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suErrors, setSuErrors]   = useState({});

  /* ------------------------ Log In state ----------------------- */
  const [liEmail, setLiEmail] = useState("");
  const [liPw, setLiPw]       = useState("");
  const [liErrors, setLiErrors] = useState({});

  /* -------------------------- Handlers ------------------------- */
  const handleSignup = (e) => {
    e.preventDefault();
    const errs = {};

    if (!isPfwEmail(suEmail)) {
      errs.email = "Use your @pfw.edu email address.";
    }
    if (!isStrongPassword(suPw)) {
      errs.password = "Password must be at least 8 characters.";
    }
    if (suPw !== suConfirm) {
      errs.confirm = "Passwords do not match.";
    }

    setSuErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Save a USER to session
    setUser({
      id: "u" + Date.now(),
      name: suEmail.split("@")[0],
      email: suEmail.trim().toLowerCase(),
      role: "user",
      studentId: "PFW123456",
    });

    // Redirect to login with a success banner
    navigate("/login", {
      state: { message: "Account created successfully! Please log in to continue." },
      replace: true,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const errs = {};
    if (!/\S+@\S+\.\S+/.test(liEmail)) errs.email = "Enter a valid email.";
    if (!liPw) errs.password = "Enter your password.";
    setLiErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const emailLower = liEmail.trim().toLowerCase();

    // 🔐 Single dedicated admin (no adminAuth.js needed)
    if (emailLower === "admin@mastoride.edu" && liPw === "Admin#123") {
      setUser({
        id: "a1",
        name: "Administrator",
        email: "admin@mastoride.edu",
        role: "admin",
      });
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    // Normal USER login (mock)
    setUser({
      id: "u1",
      name: emailLower.split("@")[0],
      email: emailLower,
      role: "user",
      studentId: "PFW123456",
    });
    navigate("/user/dashboard", { replace: true });
  };

  return (
    <>
      <Navbar />

      <main className="page-container" style={{ display: "grid", placeItems: "start center" }}>
        <h1 className="welcome" style={{ marginTop: 8 }}>Welcome to MastoRide</h1>
        <p className="lead" style={{ textAlign: "center", maxWidth: 780 }}>
          Affordable, safe rides from campus to anywhere off-campus. Exclusively for verified PFW students with a valid
          <code> .edu</code> email.
        </p>

        {/* Success banner from redirect (e.g. after signup) */}
        {successMsg && (
          <div
            style={{
              padding: "16px 20px",
              background: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: 12,
              margin: "0 auto 20px",
              fontSize: 15,
              fontWeight: 600,
              textAlign: "center",
              maxWidth: 600,
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* Tabs */}
        <section className="card-wrap" style={{ width: "100%", maxWidth: 720 }}>
          <input ref={signupRadio} type="radio" name="auth-tab" id="tab-signup" className="tab-radio" defaultChecked />
          <input ref={loginRadio}  type="radio" name="auth-tab" id="tab-login"  className="tab-radio" />

          <div className="auth-card-large" style={card}>
            <div className="tablist" role="tablist" aria-label="Authentication" style={tablist}>
              <label className="tab" htmlFor="tab-signup" role="tab" aria-controls="panel-signup" style={tab}>Create account</label>
              <label className="tab" htmlFor="tab-login" role="tab" aria-controls="panel-login" style={tab}>Log in</label>
            </div>

            {/* Sign Up */}
            <section id="panel-signup" className="panel" role="tabpanel" aria-labelledby="tab-signup">
              <header className="panel-header">
                <h2>Create a new account</h2>
                <p className="panel-subtitle">It's quick and easy.</p>
              </header>

              <form className="auth-form" onSubmit={handleSignup} noValidate style={formGrid}>
                <div className="field">
                  <label htmlFor="su-email">PFW email</label>
                  <input
                    id="su-email"
                    type="email"
                    placeholder="name@pfw.edu"
                    autoComplete="email"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    aria-invalid={!!suErrors.email}
                    aria-describedby="su-email-err su-email-hint"
                    style={input}
                  />
                  {!suErrors.email && (
                    <div id="su-email-hint" className="hint">Use your @pfw.edu email address.</div>
                  )}
                  {suErrors.email && (
                    <div id="su-email-err" className="error" role="alert" style={errText}>{suErrors.email}</div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="su-password">Create password</label>
                  <input
                    id="su-password"
                    type="password"
                    placeholder="8+ characters"
                    minLength={8}
                    autoComplete="new-password"
                    value={suPw}
                    onChange={(e) => setSuPw(e.target.value)}
                    aria-invalid={!!suErrors.password}
                    aria-describedby="su-pw-err"
                    style={input}
                  />
                  {suErrors.password && (
                    <div id="su-pw-err" className="error" role="alert" style={errText}>{suErrors.password}</div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="su-confirm">Confirm password</label>
                  <input
                    id="su-confirm"
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    value={suConfirm}
                    onChange={(e) => setSuConfirm(e.target.value)}
                    aria-invalid={!!suErrors.confirm}
                    aria-describedby="su-confirm-err"
                    style={input}
                  />
                  {suErrors.confirm && (
                    <div id="su-confirm-err" className="error" role="alert" style={errText}>{suErrors.confirm}</div>
                  )}
                </div>

                <button type="submit" className="ud-btn ud-btn-primary" style={btnPrimary}>Create account</button>
              </form>

              <p style={{ fontSize: 13, marginTop: 8 }}>
                Already have an account?{" "}
                <label htmlFor="tab-login" style={{ color: "#0070f3", cursor: "pointer", fontWeight: 700 }}>
                  Log in
                </label>
              </p>
            </section>

            {/* Log In */}
            <section id="panel-login" className="panel" role="tabpanel" aria-labelledby="tab-login">
              <header className="panel-header">
                <h2>Log in</h2>
                <p className="panel-subtitle">Welcome back — sign in to continue.</p>
              </header>

              <form className="auth-form" onSubmit={handleLogin} noValidate style={formGrid}>
                <div className="field">
                  <label htmlFor="li-email">Email</label>
                  <input
                    id="li-email"
                    type="email"
                    placeholder="you@pfw.edu"
                    autoComplete="email"
                    value={liEmail}
                    onChange={(e) => setLiEmail(e.target.value)}
                    aria-invalid={!!liErrors.email}
                    aria-describedby="li-email-err"
                    style={input}
                  />
                  {liErrors.email && (
                    <div id="li-email-err" className="error" role="alert" style={errText}>{liErrors.email}</div>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="li-password">Password</label>
                  <input
                    id="li-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={liPw}
                    onChange={(e) => setLiPw(e.target.value)}
                    aria-invalid={!!liErrors.password}
                    aria-describedby="li-pw-err"
                    style={input}
                  />
                  {liErrors.password && (
                    <div id="li-pw-err" className="error" role="alert" style={errText}>{liErrors.password}</div>
                  )}
                </div>

                <button type="submit" className="ud-btn ud-btn-primary" style={btnPrimary}>Log in</button>

                <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <Link to="/forgot-password">Forgot password?</Link>
                  <label htmlFor="tab-signup" style={{ color: "#0070f3", cursor: "pointer", fontWeight: 700 }}>
                    Create an account
                  </label>
                </div>
              </form>
            </section>
          </div>
        </section>

        {/* Optional: your QR download block */}
        <div style={{ marginTop: 18 }}>
          <QRDownload />
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ---------------------- tiny inline styles ---------------------- */
const card = {
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  border: "1px solid #eee",
  boxShadow: "0 6px 24px rgba(0,0,0,.12)",
};

const tablist = { display: "flex", gap: 8, marginBottom: 12 };
const tab = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid #e7e7e7",
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const formGrid = { display: "grid", gap: 12, maxWidth: 560 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  background: "#eef4ff",
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#fff",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const errText = { color: "#b10000", fontWeight: 600, fontSize: 13 };

import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, clearUser } from "../utils/session";

const LOGO_SRC = "/assets/images/ourlogos.jpeg";

export default function Navbar() {
  const nav = useNavigate();
  const user = getUser();
  const isLoggedIn = !!user;           // ✅ simple: any user object = logged in
  const isAdmin = user?.role === "admin";

  const signOut = () => {
    clearUser();
    nav("/", { replace: true });
  };

  // Show login buttons only when nobody is logged in
  return (
    <header className="mr-navbar">
      <div className="mr-nav-inner">
        {/* Brand */}
        <Link to="/" className="MastoRide logo" aria-label="Home">
          <img src={LOGO_SRC} alt="MastoRide logo" className="mr-logo" />
        </Link>

        {/* Center links */}
        <nav className="mr-links" aria-label="Primary">
          <NavLink to="/" end className="mr-link">
            Home
          </NavLink>
          <NavLink to="/about" className="mr-link">
            About
          </NavLink>
          <NavLink to="/services" className="mr-link">
            Services
          </NavLink>
          <NavLink to="/pricing" className="mr-link">
            Pricing
          </NavLink>
          <NavLink to="/contact" className="mr-link">
            Contact us
          </NavLink>
        </nav>

        {/* Right side actions */}
        <div className="mr-actions">
          {/* 🙋 Public (not logged in) */}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="mr-btn mr-btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="mr-btn">
                Sign up
              </Link>
              <Link to="/admin/login" className="mr-btn mr-btn-warn">
                Log in as Admin
              </Link>
            </>
          )}

          {/* 👤 Logged in (user or admin) – show on ALL pages */}
          {isLoggedIn && (
            <>
              <Link
                to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                className="mr-btn mr-btn-primary"
              >
                My Profile
              </Link>
              <button onClick={signOut} className="mr-btn mr-btn-danger">
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
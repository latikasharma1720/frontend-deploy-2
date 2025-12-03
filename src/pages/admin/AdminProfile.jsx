import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getUser, setUser } from "../../utils/session";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Administrator",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "admin") {
      setErr("No admin profile found. Please check your authentication.");
      return;
    }
    setErr("");
    setProfile({
      name: u.name || "Administrator",
      email: u.email || "admin@mastoride.edu",
      phone: u.phone || "",
      role: "Administrator",
    });
  }, []);

  const save = (e) => {
    e.preventDefault();
    const current = getUser();
    if (!current || current.role !== "admin") {
      setErr("No admin profile found. Please check your authentication.");
      return;
    }
    const next = {
      ...current,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: "admin",
    };
    setUser(next);
    setErr("");
    alert("Admin profile saved.");
  };

  return (
    <>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 820, margin: "0 auto" }}>
        <h2>Admin Profile</h2>

        {err && (
          <div
            style={{
              background: "#ffe7e7",
              border: "1px solid #ffcccc",
              color: "#b10000",
              padding: "10px 12px",
              borderRadius: 8,
              margin: "8px 0 12px",
              fontWeight: 600,
            }}
          >
            {err}
          </div>
        )}

        <form onSubmit={save} style={{ display: "grid", gap: 12 }}>
          <label>
            Full Name
            <input
              style={input}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </label>

          <label>
            Email
            <input
              style={input}
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="admin@mastoride.edu"
            />
          </label>

          <label>
            Phone
            <input
              style={input}
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </label>

          <label>
            Role
            <input style={input} value="Administrator" readOnly />
          </label>

          <button type="submit" style={btnPrimary}>
            Save Changes
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  marginTop: 6,
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#00c27a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 6,
};

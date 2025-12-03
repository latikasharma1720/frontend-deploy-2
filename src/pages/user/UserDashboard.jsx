// src/pages/user/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getUser } from "../../utils/session";
import { useToast } from "../../components/ui-kit";
import { getProfile, saveProfile, getSettings, saveSettings } from "../../utils/data";
import MapBlock from "../../components/MapBlock";

const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "book", label: "Book Ride", icon: "🚗" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "rewards", label: "Rewards", icon: "🏅" },
  { id: "history", label: "History", icon: "🕘" },
];

const LS_KEYS = {
  ride: "ud_ride_draft",
  tab: "ud_active_tab",
  sidebar: "ud_sidebar_open",
};

const getDefaultAvailableBadges = () => [
  { id: Date.now() + 1, icon: "🚗", title: "10 Rides Completed", date: "Earned on Oct 20, 2025", type: "achievement" },
  { id: Date.now() + 2, icon: "🏅", title: "Gold Rider", description: "Exclusive 10% off next ride", type: "reward" },
  { id: Date.now() + 3, icon: "🎯", title: "Early Bird", description: "Book 5 rides before 8 AM", type: "achievement" },
  { id: Date.now() + 4, icon: "🌟", title: "Weekend Warrior", description: "Complete 10 weekend rides", type: "achievement" },
];

const VEHICLES = {
  economy: { label: "🚕 Economy", multiplier: 1 },
  premium: { label: "🚘 Premium", multiplier: 2 },
  xl: { label: "🚐 XL", multiplier: 1.5 },
};

const getRideHistory = () => [
  {
    id: 1,
    date: "09/22",
    fullDate: "September 22, 2025",
    pickup: "Campus Center",
    dropoff: "Jefferson Pointe Mall",
    destination: "Off-Campus Destination — Fort Wayne",
    price: "$12.50",
    paymentMethod: "Visa Card",
    status: "Completed",
  },
  {
    id: 2,
    date: "09/19",
    fullDate: "September 19, 2025",
    pickup: "Dorms",
    dropoff: "Fort Wayne International Airport",
    destination: "Off-Campus Destination — Fort Wayne",
    price: "$22.75",
    paymentMethod: "Visa Card",
    status: "Completed",
  },
  {
    id: 3,
    date: "09/15",
    fullDate: "September 15, 2025",
    pickup: "Library",
    dropoff: "Student Union",
    destination: "On-Campus",
    price: "$5.00",
    paymentMethod: "Apple Pay",
    status: "Completed",
  },
  {
    id: 4,
    date: "09/10",
    fullDate: "September 10, 2025",
    pickup: "Engineering Building",
    dropoff: "Glenbrook Square Mall",
    destination: "Off-Campus Destination — Fort Wayne",
    price: "$18.50",
    paymentMethod: "Visa Card",
    status: "Completed",
  },
];

export default function UserDashboard() {
  const { pushToast } = useToast();

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(LS_KEYS.tab) || "profile");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.sidebar);
    return raw == null ? true : raw === "true";
  });

  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Expanded profile object (longer desktop form)
  const [profile, setProfile] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    address: "",
    emergencyContact: "",
    dob: "",
    preferredVehicle: "",
    bio: "",
  });

  const [settings, setSettings] = useState({
    rideAlerts: true,
    marketing: false,
    wheelchairAccess: false,
    darkMode: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [ride, setRide] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.ride);
      return JSON.parse(raw) || {
        pickup: "",
        dropoff: "",
        date: "",
        time: "",
        passengers: 1,
        vehicleType: "economy",
      };
    } catch {
      return { pickup: "", dropoff: "", date: "", time: "", passengers: 1, vehicleType: "economy" };
    }
  });

  const [fare, setFare] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Card payment state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const [availableBadges, setAvailableBadges] = useState([]);
  const [usedBadges, setUsedBadges] = useState([]);
  const [badgesInitialized, setBadgesInitialized] = useState(false);

  const [rideHistory, setRideHistory] = useState([]);

  // --- History filter states ---
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // profile inner tabs
  const [profileSubTab, setProfileSubTab] = useState("account");

  // --- Support form state ---
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [sendingSupport, setSendingSupport] = useState(false);

  useEffect(() => { localStorage.setItem(LS_KEYS.tab, activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem(LS_KEYS.sidebar, String(sidebarOpen)); }, [sidebarOpen]);
  useEffect(() => { localStorage.setItem(LS_KEYS.ride, JSON.stringify(ride)); }, [ride]);

  useEffect(() => {
    const u = getUser();
    setCurrentUser(u || null);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.email || currentUser.id || "demo-user";

    const stored = getProfile(uid);
    setProfile({
      name: stored.name || currentUser.name || "user1",
      studentId: stored.studentId || currentUser.studentId || "PFW123456",
      email: stored.email || currentUser.email || "user1@pfw.edu",
      phone: stored.phone || currentUser.phone || "",
      department: stored.department || "",
      year: stored.year || "",
      address: stored.address || "",
      emergencyContact: stored.emergencyContact || "",
      dob: stored.dob || "",
      preferredVehicle: stored.preferredVehicle || "",
      bio: stored.bio || "",
    });

    const loadedSettings = getSettings(uid);
    setSettings({
      rideAlerts: loadedSettings.rideAlerts ?? true,
      marketing: loadedSettings.marketing ?? false,
      wheelchairAccess: loadedSettings.wheelchairAccess ?? false,
      darkMode: loadedSettings.darkMode ?? false,
    });

    setDisplayName(stored.name || currentUser.name || "user1");

    try {
      const a = localStorage.getItem(`badges_available_${uid}`);
      const u = localStorage.getItem(`badges_used_${uid}`);
      setAvailableBadges(a ? JSON.parse(a) : getDefaultAvailableBadges());
      setUsedBadges(u ? JSON.parse(u) : []);
    } catch {
      setAvailableBadges(getDefaultAvailableBadges());
      setUsedBadges([]);
    }
    setBadgesInitialized(true);

    setRideHistory(getRideHistory());
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !badgesInitialized) return;
    setTimeout(() => {
      (async () => {
        try {
          // Simulate payment success, then persist booking to backend
          const studentEmail = currentUser?.email || profile.email || "";
          const studentName = currentUser?.name || profile.name || "";
          const studentId = (studentEmail.split("@")[0]) || profile.studentId || "student";

          const payload = {
            studentId,
            studentEmail,
            studentName,
            pickup: ride.pickup || "",
            dropoff: ride.dropoff || "",
            rideDate: ride.date || "",
            rideTime: ride.time || "",
            passengers: ride.passengers || 1,
            vehicleType: ride.vehicleType || "economy",
            estimatedFare: fare ? parseFloat(fare) : 0,
            paymentMethod: "Card",
            pickupNotes: profile.pickupNotes || "",
            accessibilityNeeds: settings.wheelchairAccess ? "Wheelchair access" : "",
          };

          // Basic client-side validation before hitting backend
          if (!payload.pickup || !payload.dropoff || !payload.rideDate || !payload.rideTime || !payload.studentEmail) {
            pushToast("Please complete ride details before payment.", "error");
          } else {
            // Create booking
            const createRes = await fetch("http://localhost:5001/api/booking", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const createData = await createRes.json();

            if (!createRes.ok) {
              pushToast(createData.error || "Failed to create booking", "error");
            } else {
              const bookingId = createData.booking?._id;
              // Mark booking completed to generate ride history
              if (bookingId) {
                await fetch(`http://localhost:5001/api/booking/${bookingId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    status: "completed",
                    actualFare: fare ? parseFloat(fare) : payload.estimatedFare || 0,
                    paymentStatus: "completed",
                  }),
                });
              }

              pushToast("Payment successful! Ride confirmed!", "success");
            }
          }
        } catch (err) {
          console.error("[payment->booking] error", err);
          pushToast("Could not save booking. Please try again.", "error");
        } finally {
          setProcessingPayment(false);
          setPaymentConfirmed(true);
          // Clear card details after successful payment
          setCardDetails({
            cardNumber: "",
            cardholderName: "",
            expiryDate: "",
            cvv: "",
          });
        }
      })();
    }, 800);
  }, [currentUser, badgesInitialized, fare, ride, settings, profile]);
  if (!authChecked) return null;
  if (!currentUser || (currentUser.role !== "user" && currentUser.role !== "student")) return <Navigate to="/login" replace />;

  const uid = currentUser.email || currentUser.id || "demo-user";

  /* Handlers */
  function toggleEditMode() { 
    setIsEditing((v) => {
      console.log('Toggling edit mode from', v, 'to', !v);
      return !v;
    }); 
  }

  function onProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (!/\S+@\S+\.\S+/.test(profile.email)) {
        pushToast("Please enter a valid email.", "error");
        return;
      }
      saveProfile(uid, profile);
      setDisplayName(profile.name);
      pushToast("Profile saved!", "success");
      setIsEditing(false);
    } catch {
      pushToast("Could not save profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  function onToggleSetting(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  async function onSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      saveSettings(uid, settings);
      pushToast("Settings saved!", "success");
    } catch {
      pushToast("Could not save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  }

  const handleEstimateFare = (e) => {
    e.preventDefault();
    setEstimating(true);
    const base = 3.5;
    const perMile = 1.75;
    const distance = Math.floor(Math.random() * 10) + 1;
    const mult = VEHICLES[ride.vehicleType].multiplier;
    const total = (base + distance * perMile) * ride.passengers * mult;
    setTimeout(() => { setFare(total.toFixed(2)); setEstimating(false); }, 300);
  };

  // Card formatting helper functions
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    
    // Validate card details
    if (!cardDetails.cardNumber.trim() || !cardDetails.cardholderName.trim() || 
        !cardDetails.expiryDate.trim() || !cardDetails.cvv.trim()) {
      pushToast("Please fill in all card details");
      return;
    }

    // Basic card number validation (16 digits)
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      pushToast("Please enter a valid 16-digit card number");
      return;
    }

    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      pushToast("Please enter a valid CVV (3-4 digits)");
      return;
    }

    // Expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      pushToast("Please enter expiry date in MM/YY format");
      return;
    }

    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentConfirmed(true);
      
      // Clear card details after successful payment
      setCardDetails({
        cardNumber: "",
        cardholderName: "",
        expiryDate: "",
        cvv: "",
      });
      
      pushToast("Payment successful! Ride confirmed!");
    }, 1500);
  };

  const handleUseBadge = (badgeId) => {
    const badgeToUse = availableBadges.find((b) => b.id === badgeId);
    if (!badgeToUse) return;

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const usedBadge = { ...badgeToUse, date: `Used on ${currentDate}`, usedDate: new Date().toISOString() };
    setAvailableBadges((prev) => prev.filter((b) => b.id !== badgeId));
    setUsedBadges((prev) => [usedBadge, ...prev]);
    pushToast(`Badge "${badgeToUse.title}" has been used!`, "success");
  };

  // --- Support submit handler (mailto: support@mastoride.com) ---
  const onSupportSubmit = (e) => {
    e.preventDefault();
    const subject = supportForm.subject.trim();
    const message = supportForm.message.trim();
    if (!subject || !message) return;

    setSendingSupport(true);

    const to = "support@mastoride.com";
    const body = `From: ${profile.email || "unknown@pfw.edu"}\n\n${message}`;
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // open default mail client with the filled message
    window.location.href = mailto;

    // small UX delay, then clear
    setTimeout(() => {
      setSendingSupport(false);
      setSupportForm({ subject: "", message: "" });
      // toast so user gets immediate feedback
      pushToast("Opening your email app with the message.", "success");
    }, 300);
  };

  // --- Filter and sort ride history ---
  const getFilteredAndSortedRides = () => {
    let filtered = [...rideHistory];

    // Filter by period
    if (filterPeriod === "month") {
      const now = new Date();
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.fullDate);
        return rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear();
      });
    } else if (filterPeriod === "year") {
      const now = new Date();
      filtered = filtered.filter(ride => {
        const rideDate = new Date(ride.fullDate);
        return rideDate.getFullYear() === now.getFullYear();
      });
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(ride => ride.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Sort
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
    }

    return filtered;
  };

  const filteredRides = getFilteredAndSortedRides();

  // Calculate total rides and total spent
  const totalRides = rideHistory.length;
  const totalSpent = rideHistory.reduce((sum, ride) => sum + parseFloat(ride.price.replace('$', '')), 0).toFixed(2);

  return (
    <>
      <div className="navbar-fix">
        <Navbar />
      </div>

      <div className={`ud ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="dashboard-layout">
          <aside className="sidebar-nav" aria-label="Section navigation">
            <button
              className="sidebar-toggle fancy"
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-expanded={sidebarOpen}
            >
              <span className="hamburger">
                <span className="line top" />
                <span className="line middle" />
                <span className="line bottom" />
              </span>
            </button>
            <nav className="sidebar-tabs">
              {NAV_ITEMS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={`sidebar-btn ${activeTab === id ? "active" : ""}`}
                  onClick={() => setActiveTab(id)}
                  data-tip={label}
                  aria-label={label}
                >
                  <span className="sb-icon" aria-hidden="true">{icon}</span>
                  <span className="sb-label">{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="dashboard-main">
            <div className="dashboard-content-wrapper">
              {/* PROFILE (includes Account + Settings + Support) */}
              {activeTab === "profile" && (
                <div className="clean-profile-layout">
                  <div className="profile-main-card profile-wide">{/* wider desktop card */}
                    <div className="profile-hero">
                      <div className="profile-hero-left">
                        <div className="profile-avatar-large">
                          <span className="avatar-circle-large">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                        <div className="profile-hero-info">
                          <h2>{profile.name || "User"}</h2>
                          <p>{profile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-tabs">
                      {["account", "settings", "support"].map((k) => (
                        <button
                          key={k}
                          className={`profile-tab-btn ${profileSubTab === k ? "active" : ""}`}
                          onClick={() => setProfileSubTab(k)}
                          type="button"
                        >
                          {k === "account" ? "Account" : k === "settings" ? "Settings" : "Support"}
                        </button>
                      ))}
                    </div>

                    {/* Account – LONG desktop layout */}
                    {profileSubTab === "account" && (
                      <section className="profile-section">
                        <form className="clean-profile-form" onSubmit={onSaveProfile}>

                          {/* Group 1: Personal Info */}
                          <div className="profile-group">
                            <div className="group-title">Personal Info</div>
                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Full Name</span>
                                <input
                                  name="name"
                                  type="text"
                                  placeholder="Your Full Name"
                                  value={profile.name}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Student ID</span>
                                <input
                                  name="studentId"
                                  type="text"
                                  placeholder="Your ID"
                                  value={profile.studentId}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Email</span>
                                <input
                                  name="email"
                                  type="email"
                                  placeholder="you@pfw.edu"
                                  value={profile.email}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Phone</span>
                                <input
                                  name="phone"
                                  type="tel"
                                  placeholder="(optional)"
                                  value={profile.phone}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Department</span>
                                <input
                                  name="department"
                                  type="text"
                                  placeholder="e.g., Computer Science"
                                  value={profile.department}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Year of Study</span>
                                <input
                                  name="year"
                                  type="text"
                                  placeholder="e.g., 2nd Year"
                                  value={profile.year}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Address</span>
                                <input
                                  name="address"
                                  type="text"
                                  placeholder="1234 Campus Drive, Fort Wayne"
                                  value={profile.address}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Emergency Contact</span>
                                <input
                                  name="emergencyContact"
                                  type="tel"
                                  placeholder="Parent/Guardian number"
                                  value={profile.emergencyContact}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Date of Birth</span>
                                <input
                                  name="dob"
                                  type="date"
                                  value={profile.dob}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Preferred Vehicle Type</span>
                                <select
                                  name="preferredVehicle"
                                  value={profile.preferredVehicle}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                >
                                  <option value="">Select Vehicle</option>
                                  <option value="economy">Economy</option>
                                  <option value="premium">Premium</option>
                                  <option value="xl">XL</option>
                                </select>
                              </label>
                            </div>

                            <div className="grid-one">
                              <label className="clean-field">
                                <span>Bio / About You</span>
                                <textarea
                                  name="bio"
                                  rows={4}
                                  placeholder="Write a short description about yourself..."
                                  value={profile.bio}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Group 2: Ride Preferences */}
                          <div className="profile-group">
                            <div className="group-title">Ride Preferences</div>
                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Default Pickup Notes</span>
                                <input
                                  name="pickupNotes"
                                  type="text"
                                  placeholder="e.g., Meet near the south entrance"
                                  value={profile.pickupNotes || ""}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Accessibility Needs</span>
                                <input
                                  name="accessNeeds"
                                  type="text"
                                  placeholder="e.g., Wheelchair access"
                                  value={profile.accessNeeds || ""}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="profile-actions">
                            {!isEditing ? (
                              <button 
                                className="btn" 
                                type="button" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Edit button clicked!');
                                  toggleEditMode();
                                }}
                              >
                                Edit
                              </button>
                            ) : (
                              <>
                                <button className="btn" type="submit" disabled={savingProfile}>
                                  {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                                <button 
                                  className="btn ghost" 
                                  type="button" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Cancel button clicked!');
                                    toggleEditMode();
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </form>
                      </section>
                    )}

                    {/* Settings (inside Profile) */}
                    {profileSubTab === "settings" && (
                      <section className="profile-section">
                        <header className="ud-head">
                        </header>
                        <form className="ud-form" onSubmit={onSaveSettings}>
                          <div className="setting-item">
                            <div><strong>Wheelchair Access</strong><p>Request wheelchair-accessible vehicles</p></div>
                            <label className="toggle">
                              <input type="checkbox" checked={settings.wheelchairAccess} onChange={() => onToggleSetting("wheelchairAccess")} />
                              <span />
                            </label>
                          </div>
                          <div className="setting-item">
                            <div><strong>Ride Alerts</strong><p>Receive notifications for ride updates</p></div>
                            <label className="toggle">
                              <input type="checkbox" checked={settings.rideAlerts} onChange={() => onToggleSetting("rideAlerts")} />
                              <span />
                            </label>
                          </div>
                          <div className="setting-item">
                            <div><strong>Marketing Emails</strong><p>Get news and promotions</p></div>
                            <label className="toggle">
                              <input type="checkbox" checked={settings.marketing} onChange={() => onToggleSetting("marketing")} />
                              <span />
                            </label>
                          </div>
                          <button className="btn wide" type="submit" disabled={savingSettings}>
                            {savingSettings ? "Saving..." : "Save Settings"}
                          </button>
                        </form>
                      </section>
                    )}

                    {/* Support (inside Profile) */}
                    {profileSubTab === "support" && (
                      <section className="profile-section">
                        <header className="ud-head">
                        </header>

                        <div className="support-intro">
                          <p>
                            You can reach our support team anytime via email at <strong>support@mastoride.com</strong>.
                          </p>
                        </div>

                        <form className="support-form" onSubmit={onSupportSubmit}>
                          <label className="clean-field">
                            <span>Subject</span>
                            <input
                              type="text"
                              placeholder="Brief summary of the issue"
                              value={supportForm.subject}
                              onChange={(e) => setSupportForm((s) => ({ ...s, subject: e.target.value }))}
                              required
                            />
                          </label>

                          <label className="clean-field">
                            <span>Message</span>
                            <textarea
                              rows={6}
                              placeholder="Describe what happened, steps to reproduce, or add ride details…"
                              value={supportForm.message}
                              onChange={(e) => setSupportForm((s) => ({ ...s, message: e.target.value }))}
                              required
                            />
                          </label>

                          <div className="profile-actions">
                            <button className="btn" type="submit" disabled={sendingSupport}>
                              {sendingSupport ? "Opening Mail…" : "Contact Support"}
                            </button>
                            <button
                              className="btn ghost"
                              type="button"
                              onClick={() => setSupportForm({ subject: "", message: "" })}
                            >
                              Clear
                            </button>
                          </div>
                        </form>
                      </section>
                    )}
                  </div>
                </div>
              )}

              {/* BOOK */}
              {activeTab === "book" && (
                <div className="book-layout">
                  <div className="book-form-col">
                    <section className="ud-hero">
                      <h1>Welcome back, {displayName || "user"}! 👋</h1>
                      <p>Plan your next ride and estimate your fare in seconds.</p>
                    </section>
                    <section className="ud-panel">
                      <header className="ud-head"><h2>Book a Ride 🚗</h2></header>
                      <form className="ud-form bookride" onSubmit={(e) => e.preventDefault()}>
                        <label className="ud-field">
                          <span>Pickup Location</span>
                          <input type="text" placeholder="e.g., Walb Student Union" value={ride.pickup} onChange={(e) => setRide({ ...ride, pickup: e.target.value })} />
                        </label>
                        <label className="ud-field">
                          <span>Drop-off Location</span>
                          <input type="text" placeholder="e.g., Coliseum Blvd" value={ride.dropoff} onChange={(e) => setRide({ ...ride, dropoff: e.target.value })} />
                        </label>
                        <div className="ud-row">
                          <label className="ud-field">
                            <span>Date</span>
                            <input type="date" value={ride.date} onChange={(e) => setRide({ ...ride, date: e.target.value })} />
                          </label>
                          <label className="ud-field">
                            <span>Time</span>
                            <input type="time" value={ride.time} onChange={(e) => setRide({ ...ride, time: e.target.value })} />
                          </label>
                        </div>
                        <div className="ud-row">
                          <label className="ud-field">
                            <span>Passengers</span>
                            <input type="number" min="1" max="6" value={ride.passengers} onChange={(e) => setRide({ ...ride, passengers: parseInt(e.target.value || "1", 10) })} />
                          </label>
                          <label className="ud-field">
                            <span>Vehicle Type</span>
                            <select value={ride.vehicleType} onChange={(e) => setRide({ ...ride, vehicleType: e.target.value })}>
                              {Object.entries(VEHICLES).map(([key, v]) => (
                                <option key={key} value={key}>{v.label}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="br-actions">
                          <button type="button" onClick={handleEstimateFare} className="estimate-btn" disabled={estimating}>
                            {estimating ? "Estimating…" : fare ? `💵 Estimated Fare: $${fare}` : "Estimate Fare"}
                          </button>
                        </div>
                        <button 
                          className="btn wide proceed-payment-btn" 
                          onClick={() => setActiveTab("payment")}
                          type="button"
                        >
                          Proceed to Payment →
                        </button>
                      </form>
                    </section>
                  </div>
                  <div className="book-map-col">
                    <MapBlock pickupText={ride.pickup} dropoffText={ride.dropoff} height={600} />
                  </div>
                </div>
              )}

              {/* PAYMENT */}
              {activeTab === "payment" && (
                <div className="payment-page-wrapper">
                  <section className="payment-hero">
                    <h1>Complete Your Payment</h1>
                    <p>Enter your card details to confirm your ride</p>
                  </section>

                  <section className="payment-card-form-container">
                    <div className="ride-summary-box">
                      <h3>Ride Summary</h3>
                      
                      {/* Map showing pickup and dropoff */}
                      <div className="ride-summary-map">
                        <MapBlock pickupText={ride.pickup} dropoffText={ride.dropoff} height={250} />
                      </div>

                      <div className="summary-row">
                        <span>📍 Pickup:</span>
                        <span>{ride.pickup || "Not set"}</span>
                      </div>
                      <div className="summary-row">
                        <span>🎯 Drop-off:</span>
                        <span>{ride.dropoff || "Not set"}</span>
                      </div>
                      <div className="summary-row">
                        <span>📅 Date:</span>
                        <span>{ride.date || "Not set"}</span>
                      </div>
                      <div className="summary-row">
                        <span>🕐 Time:</span>
                        <span>{ride.time || "Not set"}</span>
                      </div>
                      <div className="summary-row total-row">
                        <span>💰 Total Fare:</span>
                        <span className="fare-total">${fare || "0.00"}</span>
                      </div>
                    </div>

                    <form className="card-payment-form" onSubmit={handlePayNow}>
                      <h2 className="form-title">Card Details</h2>
                      
                      <div className="field">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.cardholderName}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="field">
                        <label>Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            if (formatted.replace(/\s/g, '').length <= 16) {
                              setCardDetails({ ...cardDetails, cardNumber: formatted });
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                        <div className="card-icons">
                          <span className="card-icon">💳</span>
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="field">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            value={cardDetails.expiryDate}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value);
                              if (formatted.length <= 5) {
                                setCardDetails({ ...cardDetails, expiryDate: formatted });
                              }
                            }}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                          />
                        </div>
                        <div className="field">
                          <label>CVV</label>
                          <input
                            type="text"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                setCardDetails({ ...cardDetails, cvv: value });
                              }
                            }}
                            placeholder="123"
                            maxLength="4"
                            required
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn primary pay-now-btn" 
                        disabled={processingPayment}
                      >
                        {processingPayment ? "Processing..." : `Pay Now $${fare || "0.00"}`}
                      </button>

                      <div className="payment-security-note">
                        <span className="security-icon">🔒</span>
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </form>
                  </section>

                  {paymentConfirmed && (
                    <div className="payment-overlay" onClick={() => setPaymentConfirmed(false)}>
                      <div className="payment-confirmed-card" onClick={(e) => e.stopPropagation()}>
                        <span className="payment-confirmed-icon">🎉</span>
                        <h3 className="payment-confirmed-title">RIDE CONFIRMED YAY!</h3>
                        <p className="payment-confirmed-text">Your ride has been booked successfully!</p>
                        <button 
                          className="btn wide payment-confirmed-close" 
                          onClick={() => setPaymentConfirmed(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REWARDS */}
              {activeTab === "rewards" && (
                <div className="rewards-page-wrapper">
                  <section className="rewards-hero">
                    <h1>Rewards & Badges</h1>
                    <p>Track your progress, earn rewards, and unlock exclusive perks </p>
                  </section>

                  <div className="rewards-points-card">
                    <div className="points-display">
                      <span className="trophy-icon">🏆</span>
                      <span className="points-number">250 Points</span>
                    </div>
                    <p className="points-subtitle">Keep riding to reach <strong>Gold Tier</strong></p>
                    <button className="redeem-points-btn">Redeem Points</button>
                  </div>

                  <section className="badges-section">
                    <h2 className="badges-heading"><span className="badge-emoji"></span> Available Badges</h2>
                    {availableBadges.length > 0 ? (
                      <div className="badges-grid">
                        {availableBadges.map((badge) => (
                          <div key={badge.id} className="badge-card available">
                            <div className="badge-icon">{badge.icon}</div>
                            <h3 className="badge-title">{badge.title}</h3>
                            {badge.date && <p className="badge-date">{badge.date}</p>}
                            {badge.description && <p className="badge-description">{badge.description}</p>}
                            <button className="use-badge-btn" onClick={() => handleUseBadge(badge.id)}>Use Badge</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-badges"><p> No available badges right now. Keep riding to earn more!</p></div>
                    )}
                  </section>

                  <section className="badges-section">
                    <h2 className="badges-heading"><span className="badge-emoji"></span> Used Badges</h2>
                    {usedBadges.length > 0 ? (
                      <div className="badges-grid">
                        {usedBadges.map((badge) => (
                          <div key={badge.id} className="badge-card used">
                            <div className="badge-icon">{badge.icon}</div>
                            <h3 className="badge-title">{badge.title}</h3>
                            <p className="badge-date">{badge.date}</p>
                            {badge.description && <p className="badge-description">{badge.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-badges"><p>No used badges yet</p></div>
                    )}
                  </section>
                </div>
              )}

              {/* HISTORY — centered, desktop-wide cards */}
              {activeTab === "history" && (
                <section className="ud-panel history-panel">
                  {/* Stats Cards */}
                  <div className="history-stats-grid">
                    <div className="history-stat-card">
                      <div className="stat-icon">🚗</div>
                      <div className="stat-content">
                        <div className="stat-value">{totalRides}</div>
                        <div className="stat-label">TOTAL RIDES</div>
                      </div>
                    </div>
                    <div className="history-stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-value">${totalSpent}</div>
                        <div className="stat-label">TOTAL SPENT</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="history-filter-bar">
                    <div className="filter-group">
                      <label className="filter-label">Filter:</label>
                      <select className="filter-select" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                        <option value="all">All Rides</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">Status:</label>
                      <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="filter-label">Sort by:</label>
                      <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Recent First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="price-low">Price: Low to High</option>
                      </select>
                    </div>
                  </div>

                  {/* Ride Cards */}
                  <div className="history-stack">
                    {filteredRides.length > 0 ? (
                      filteredRides.map((item, idx) => (
                        <div key={item.id} className={`ride-history-card ride-card-variant-${(idx % 4) + 1}`} style={{ "--stagger": `${idx * 100}ms` }}>
                        <div className="ride-card-header">
                          <div className="ride-date-badge">📅 {item.date}</div>
                          <div className="ride-status-badge">✅ {item.status}</div>
                        </div>

                        <div className="ride-card-body">
                          <div className="ride-route">
                            <div className="route-point">
                              <div className="route-icon pickup-icon">📍</div>
                              <div className="route-details">
                                <div className="route-label">PICKUP</div>
                                <div className="route-location">{item.pickup}</div>
                              </div>
                            </div>

                            <div className="route-line" />

                            <div className="route-point">
                              <div className="route-icon dropoff-icon">🎯</div>
                              <div className="route-details">
                                <div className="route-label">DROP-OFF</div>
                                <div className="route-location">{item.dropoff}</div>
                              </div>
                            </div>
                          </div>

                          <div className="ride-card-info">
                            <div className="info-row">
                              <span className="info-icon">📅</span>
                              <span className="info-text">Date Booked: {item.fullDate}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-icon">💳</span>
                              <span className="info-text">Payment: {item.paymentMethod}</span>
                            </div>
                            <div className="info-row">
                              <span className="info-icon">📌</span>
                              <span className="info-text">{item.destination}</span>
                            </div>
                          </div>
                        </div>

                        <div className="ride-card-footer">
                          <div className="ride-price">
                            <span className="price-label">TOTAL FARE</span>
                            <span className="price-amount">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))
                    ) : (
                      <div className="empty-history">
                        <p>📭 No rides found matching your filters</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
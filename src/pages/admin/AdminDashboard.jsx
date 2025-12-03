// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getUser } from "../../utils/session";
import { useToast } from "../../components/ui-kit";
import { getProfile, saveProfile, getSettings, saveSettings } from "../../utils/data";

const NAV_ITEMS = [
  { id: "feedback", label: "Feedback", icon: "💬" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const LS_KEYS = {
  tab: "admin_active_tab",
  sidebar: "admin_sidebar_open",
};

const STATS = [
  { id: "users", label: "Total Users", value: "1,247", icon: "👥", trend: "+12%" },
  { id: "rides", label: "Total Rides", value: "3,856", icon: "🚗", trend: "+23%" },
  { id: "drivers", label: "Active Drivers", value: "42", icon: "👨‍✈️", trend: "+5%" },
  { id: "revenue", label: "Revenue", value: "$18,450", icon: "💰", trend: "+18%" },
];


const RECENT_RIDES = [
  { id: 1, user: "John Doe", pickup: "Campus Center", dropoff: "Jefferson Pointe", fare: "$12.50", date: "Oct 22", status: "Completed" },
  { id: 2, user: "Sarah Smith", pickup: "Dorms", dropoff: "Airport", fare: "$22.75", date: "Oct 21", status: "Completed" },
  { id: 3, user: "Mike Johnson", pickup: "Library", dropoff: "Union", fare: "$5.00", date: "Oct 20", status: "Completed" },
  { id: 4, user: "Emily Davis", pickup: "Engineering", dropoff: "Mall", fare: "$18.50", date: "Oct 19", status: "Cancelled" },
];


// Line Chart (Chart.js via CDN)
function LineChart({ data, labels, title }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');

    const make = () => {
      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: title,
            data,
            borderColor: '#000000',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#000000',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#333333',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: {
              display: true, position: 'top',
              labels: { font: { size: 14, weight: '600' }, color: '#333', padding: 15, usePointStyle: true }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#fff', bodyColor: '#fff',
              borderColor: '#000000', borderWidth: 1, padding: 12, displayColors: false,
              callbacks: { label: (ctx) => `${ctx.parsed.y} rides` }
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#000000' }, ticks: { font: { size: 12 }, color: '#000000' } },
            x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#000000' } }
          }
        }
      });
    };

    if (!window.Chart) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
      s.onload = make;
      document.head.appendChild(s);
    } else {
      make();
    }

    return () => chartInstance.current?.destroy();
  }, [data, labels, title]);

  return <canvas ref={chartRef} />;
}

// Pie Chart
function PieChart({ data, labels, colors, title }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');

    const make = () => {
      chartInstance.current = new window.Chart(ctx, {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#fff', borderWidth: 3, hoverOffset: 15 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true, position: 'bottom',
              labels: { font: { size: 14, weight: '600' }, color: '#333', padding: 15, usePointStyle: true }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#fff', bodyColor: '#fff',
              borderColor: '#E7BE66', borderWidth: 1, padding: 12,
              callbacks: {
                label: (ctx) => {
                  const label = ctx.label || '';
                  const value = ctx.parsed || 0;
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = ((value / total) * 100).toFixed(1);
                  return `${label}: ${pct}% (${value} rides)`;
                }
              }
            }
          }
        }
      });
    };

    if (!window.Chart) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
      s.onload = make;
      document.head.appendChild(s);
    } else {
      make();
    }

    return () => chartInstance.current?.destroy();
  }, [data, labels, colors, title]);

  return <canvas ref={chartRef} />;
}

export default function AdminDashboard() {
  const { pushToast } = useToast();

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(LS_KEYS.tab) || "feedback");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.sidebar);
    return raw == null ? true : raw === "true";
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState("account");

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA modal state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Users management state
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Monthly ride data state
  const [monthlyRideData, setMonthlyRideData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });
  const [loadingMonthlyRides, setLoadingMonthlyRides] = useState(false);

  // Ride type data state
  const [rideTypeData, setRideTypeData] = useState({
    labels: ['Economy', 'Premium', 'XL'],
    data: [0, 0, 0],
    colors: ['#3B82F6', '#F59E0B', '#10B981'],
  });
  const [loadingRideTypes, setLoadingRideTypes] = useState(false);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        console.log(`Loaded ${data.count} users from database`);
      } else {
        pushToast("Failed to load users", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      pushToast("Error loading users from server", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch monthly ride statistics from backend
  const fetchMonthlyRides = async () => {
    setLoadingMonthlyRides(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/monthly-rides');
      const data = await response.json();
      
      if (data.success) {
        setMonthlyRideData({
          labels: data.labels,
          data: data.counts,
        });
        console.log('Loaded monthly ride statistics from database');
      } else {
        pushToast("Failed to load monthly ride data", "error");
      }
    } catch (error) {
      console.error("Error fetching monthly rides:", error);
      pushToast("Error loading monthly ride data from server", "error");
    } finally {
      setLoadingMonthlyRides(false);
    }
  };

  // Fetch ride type distribution from backend
  const fetchRideTypes = async () => {
    setLoadingRideTypes(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/ride-types');
      const data = await response.json();
      
      if (data.success) {
        setRideTypeData({
          labels: data.labels,
          data: data.data,
          colors: data.colors,
        });
        console.log('Loaded ride type distribution from database');
      } else {
        pushToast("Failed to load ride type data", "error");
      }
    } catch (error) {
      console.error("Error fetching ride types:", error);
      pushToast("Error loading ride type data from server", "error");
    } finally {
      setLoadingRideTypes(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          setUsers(users.filter(u => u.id !== userId));
          setSelectedUsers(selectedUsers.filter(id => id !== userId));
          pushToast(`${userName} has been deleted`, "success");
        } else {
          pushToast(data.error || "Failed to delete user", "error");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        pushToast("Error deleting user from server", "error");
      }
    }
  };

  // Bulk delete users handler
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      pushToast("No users selected", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`)) {
      try {
        // Delete each user using the correct admin API endpoint
        const deletePromises = selectedUsers.map(userId =>
          fetch(`http://localhost:5001/api/admin/users/${userId}`, {
            method: 'DELETE',
          }).then(response => response.json())
        );
        
        const results = await Promise.all(deletePromises);
        
        // Check if all deletions were successful
        const successCount = results.filter(result => result.success).length;
        const failCount = results.length - successCount;
        
        if (successCount > 0) {
          // Remove successfully deleted users from the UI
          setUsers(users.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
          
          if (failCount === 0) {
            pushToast(`Successfully deleted ${successCount} user(s)`, "success");
          } else {
            pushToast(`Deleted ${successCount} user(s), ${failCount} failed`, "warning");
          }
        } else {
          pushToast("Failed to delete users", "error");
        }
      } catch (error) {
        console.error("Error deleting users:", error);
        pushToast("Error deleting users from server", "error");
      }
    }
  };

  const [profile, setProfile] = useState({
    name: "Administrator",
    email: "admin@mastoride.edu",
    phone: "",
    department: "Administration",
    role: "System Admin",
    employeeId: "",
    officeLocation: "",
    joinDate: "",
    title: "",
    supervisor: "",
    emergencyContact: "",
    emergencyPhone: "",
    address: "",
    bio: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    systemAlerts: true,
    maintenanceMode: false,
  });

  const [savingSettings, setSavingSettings] = useState(false);

  // Auth check
  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "admin") {
      setAuthChecked(true);
      return;
    }
    setCurrentUser(u);
    setAuthChecked(true);
  }, []);

  // Fetch users when component mounts or when activeTab changes to "users"
  useEffect(() => {
    if (currentUser && activeTab === "users") {
      fetchUsers();
    }
  }, [currentUser, activeTab]);

  // Fetch monthly ride data when component mounts or when activeTab changes to "analytics"
  useEffect(() => {
    if (currentUser && activeTab === "analytics") {
      fetchMonthlyRides();
      fetchRideTypes();
    }
  }, [currentUser, activeTab]);

  // Load profile/settings
  useEffect(() => {
    if (!currentUser) return;
    const adminId = currentUser.id || "admin-demo";
    const stored = getProfile(adminId) || {};
    const nextProfile = {
      name: stored.name || currentUser.name || "Administrator",
      email: stored.email || currentUser.email || "admin@mastoride.edu",
      phone: stored.phone || currentUser.phone || "",
      department: stored.department || "Administration",
      role: stored.role || "System Admin",
      employeeId: stored.employeeId || "",
      officeLocation: stored.officeLocation || "",
      joinDate: stored.joinDate || "",
      title: stored.title || "",
      supervisor: stored.supervisor || "",
      emergencyContact: stored.emergencyContact || "",
      emergencyPhone: stored.emergencyPhone || "",
      address: stored.address || "",
      bio: stored.bio || "",
    };
    setProfile(nextProfile);

    const s = getSettings(adminId) || {};
    setSettings({
      emailNotifications: s.emailNotifications ?? true,
      smsAlerts: s.smsAlerts ?? false,
      systemAlerts: s.systemAlerts ?? true,
      maintenanceMode: s.maintenanceMode ?? false,
    });
  }, [currentUser]);

  // Persist UI state
  useEffect(() => { localStorage.setItem(LS_KEYS.tab, activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem(LS_KEYS.sidebar, String(sidebarOpen)); }, [sidebarOpen]);

  if (!authChecked) return null;
  if (!currentUser || currentUser.role !== "admin") return <Navigate to="/admin/login" replace />;

  function onProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (!/\S+@\S+\.\S+/.test(profile.email)) {
        pushToast("Please enter a valid email.", "error");
        setSavingProfile(false);
        return;
      }
      const adminId = currentUser.id || "admin-demo";
      saveProfile(adminId, profile);
      pushToast("Admin profile saved!", "success");
      setIsEditing(false);
    } catch {
      pushToast("Could not save admin profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  function onToggleSetting(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  function onSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const adminId = currentUser.id || "admin-demo";
      saveSettings(adminId, settings);
      pushToast("Admin settings saved!", "success");
    } catch {
      pushToast("Could not save admin settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  }

  // Password change handlers
  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  }

  function handleChangePassword(e) {
    e.preventDefault();
    setChangingPassword(true);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      pushToast("Please fill in all fields", "error");
      setChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      pushToast("New passwords don't match", "error");
      setChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      pushToast("Password must be at least 8 characters", "error");
      setChangingPassword(false);
      return;
    }

    // Simulate password change (in real app, this would call an API)
    setTimeout(() => {
      pushToast("Password changed successfully!", "success");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    }, 1000);
  }

  // 2FA handlers
  function handleEnable2FA() {
    setShow2FAModal(true);
  }

  function confirmEnable2FA() {
    setIs2FAEnabled(true);
    setShow2FAModal(false);
    pushToast("Two-Factor Authentication enabled!", "success");
  }

  function handleDisable2FA() {
    setIs2FAEnabled(false);
    pushToast("Two-Factor Authentication disabled", "info");
  }

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
              {/* OVERVIEW */}
              {activeTab === "feedback" && (
                <div className="feedback-layout">
                  <section className="ud-hero">
                    <h1>User Feedback 💬</h1>
                    <p>View and manage customer reviews and feedback</p>
                  </section>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">⭐</div>
                      <div className="stat-details">
                        <div className="stat-value">4.8</div>
                        <div className="stat-label">Average Rating</div>
                        <div className="stat-trend">+0.3</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💬</div>
                      <div className="stat-details">
                        <div className="stat-value">342</div>
                        <div className="stat-label">Total Feedback</div>
                        <div className="stat-trend">+28</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-details">
                        <div className="stat-value">89%</div>
                        <div className="stat-label">Positive Reviews</div>
                        <div className="stat-trend">+5%</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">⏱️</div>
                      <div className="stat-details">
                        <div className="stat-value">24</div>
                        <div className="stat-label">Pending Reviews</div>
                        <div className="stat-trend">-6</div>
                      </div>
                    </div>
                  </div>

                  <section className="ud-panel">
                    <header className="ud-head">
                      <h2>Recent Feedback</h2>
                      <p>Latest customer reviews</p>
                    </header>
                    <div className="activity-list">
                      <div className="activity-item">
                        <span className="activity-icon">⭐⭐⭐⭐⭐</span>
                        <div className="activity-content">
                          <strong>Excellent Service</strong>
                          <p>Great driver, smooth ride! - Sarah Johnson</p>
                        </div>
                        <span className="activity-time">2 hours ago</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">⭐⭐⭐⭐</span>
                        <div className="activity-content">
                          <strong>Good Experience</strong>
                          <p>Easy to use app, would like more payment options - Mike Chen</p>
                        </div>
                        <span className="activity-time">5 hours ago</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">⭐⭐</span>
                        <div className="activity-content">
                          <strong>Needs Improvement</strong>
                          <p>Wait time was longer than expected - Emily Rodriguez</p>
                        </div>
                        <span className="activity-time">1 day ago</span>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* USERS */}
              {activeTab === "users" && (
                <div className="users-layout" style={{ padding: '40px 60px', maxWidth: '1400px', margin: '0 auto' }}>
                  {/* Header Card */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f8a96f 0%, #f58c65 100%)',
                    padding: '28px 40px',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(248, 169, 111, 0.25)',
                    animation: 'fadeInDown 0.5s ease-out'
                  }}>
                    <h1 style={{ 
                      fontSize: '2rem', 
                      fontWeight: '900', 
                      marginBottom: '8px', 
                      color: '#000',
                      textShadow: 'none'
                    }}>
                      User Management
                    </h1>
                    <p style={{ 
                      fontSize: '1rem', 
                      color: 'rgba(0,0,0,0.7)', 
                      maxWidth: '700px', 
                      margin: '0 auto',
                      lineHeight: '1.5'
                    }}>
                      Manage all users in one place. Control access, assign roles, and monitor activity!
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    marginBottom: '32px',
                    alignItems: 'center',
                    animation: 'fadeInUp 0.6s ease-out 0.1s backwards'
                  }}>
                    {/* Search */}
                    <div style={{ flex: '1', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#9ca3af' }}>🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px 14px 48px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f8a96f'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>

                    {/* Export Button */}
                    <button style={{
                      padding: '14px 28px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: '#fff',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f8a96f';
                      e.currentTarget.style.background = '#fff5f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#fff';
                    }}
                    onClick={() => pushToast("Exporting users...", "success")}>
                      <span style={{ fontSize: '1.2rem' }}>📤</span>
                      Export
                    </button>

                    {/* Add User Button */}
                    <button style={{
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #f8a96f 0%, #f58c65 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(248, 169, 111, 0.4)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(248, 169, 111, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(248, 169, 111, 0.4)';
                    }}
                    onClick={() => pushToast("Add user functionality coming soon!", "info")}>
                      <span style={{ fontSize: '1.2rem' }}>➕</span>
                      Add User
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{ 
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#374151', color: '#fff' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', width: '40px' }}>
                              <input 
                                type="checkbox" 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(filteredUsers.map(u => u.id));
                                  } else {
                                    setSelectedUsers([]);
                                  }
                                }}
                              />
                            </th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>Joined Date</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>Status</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>No users found</div>
                                <div>Try adjusting your search query</div>
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user, index) => (
                              <tr 
                                key={user.id}
                                style={{ 
                                  borderBottom: '1px solid #f3f4f6',
                                  transition: 'all 0.2s ease',
                                  animation: `fadeInUp 0.4s ease-out ${0.3 + index * 0.1}s backwards`
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '16px 20px' }}>
                                  <input 
                                    type="checkbox" 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers([...selectedUsers, user.id]);
                                      } else {
                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                      }
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                      width: '40px', 
                                      height: '40px', 
                                      borderRadius: '50%', 
                                      background: 'linear-gradient(135deg, #f8a96f 0%, #f58c65 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '1.4rem',
                                      fontWeight: '700',
                                      color: '#fff'
                                    }}>
                                      {user.name.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{user.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{user.email}</td>
                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{user.joined}</td>
                                <td style={{ padding: '16px 20px' }}>
                                  <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                    color: user.status === 'Active' ? '#065f46' : '#991b1b'
                                  }}>
                                    {user.status}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                      style={{
                                        padding: '8px 16px',
                                        background: '#fee2e2',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#ef4444';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#fee2e2';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                      title="Delete User"
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Results Info */}
                    {filteredUsers.length > 0 && (
                      <div style={{ 
                        padding: '16px 24px',
                        borderTop: '1px solid #f3f4f6',
                        background: '#fafafa',
                        color: '#6b7280',
                        fontSize: '0.95rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                          {selectedUsers.length > 0 && (
                            <span style={{ marginLeft: '16px' }}>
                              • <strong>{selectedUsers.length}</strong> selected
                            </span>
                          )}
                        </div>
                        {selectedUsers.length > 0 && (
                          <button
                            style={{
                              padding: '8px 20px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#dc2626';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            onClick={handleBulkDelete}
                          >
                            🗑️ Delete Selected ({selectedUsers.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}                            
              {/* ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="analytics-layout">
                  <section className="ud-hero">
                  </section>

                  <div className="analytics-grid">
                    {/* Line Chart */}
                    <div>
                      <div className="chart-heading-card">
                        <h3>Monthly Ride Bookings</h3>
                      </div>
                      <section className="ud-panel chart-panel">
                        <div className="chart-container">
                          {loadingMonthlyRides ? (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              height: '300px',
                              fontSize: '1.2rem',
                              color: '#666'
                            }}>
                              Loading monthly ride data...
                            </div>
                          ) : (
                            <LineChart
                              data={monthlyRideData.data}
                              labels={monthlyRideData.labels}
                              title="Monthly Rides"
                            />
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <div className="chart-heading-card">
                        <h3>Ride Type Distribution</h3>
                      </div>
                      <section className="ud-panel chart-panel">
                        <div className="chart-container pie">
                          {loadingRideTypes ? (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              height: '300px',
                              fontSize: '1.2rem',
                              color: '#666'
                            }}>
                              Loading ride type data...
                            </div>
                          ) : (
                            <PieChart
                              data={rideTypeData.data}
                              labels={rideTypeData.labels}
                              colors={rideTypeData.colors}
                              title="Ride Types"
                            />
                          )}
                        </div>
                      </section>
                    </div>
                  </div>

                  {/* (User Feedback section previously removed) */}
                </div>
              )}

              {/* PROFILE */}
              {activeTab === "profile" && (
                <div className="clean-profile-layout">
                  <div className="profile-main-card profile-wide">
                    <div className="profile-hero">
                      <div className="profile-hero-left">
                        <div className="profile-avatar-large">
                          <span className="avatar-circle-large">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                          </span>
                        </div>
                        <div className="profile-hero-info">
                          <h2>{profile.name || "Administrator"}</h2>
                          <p>{profile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-tabs">
                      {["account", "settings", "security"].map((k) => (
                        <button
                          key={k}
                          className={`profile-tab-btn ${profileSubTab === k ? "active" : ""}`}
                          onClick={() => setProfileSubTab(k)}
                          type="button"
                        >
                          {k === "account" ? "Account" : k === "settings" ? "Settings" : "Security"}
                        </button>
                      ))}
                    </div>

                    {profileSubTab === "account" && (
                      <section className="profile-section">
                        <form className="clean-profile-form" onSubmit={onSaveProfile}>
                          <div className="profile-group">
                            <div className="group-title">Basic Information</div>
                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Full Name</span>
                                <input
                                  name="name"
                                  type="text"
                                  placeholder="Administrator Name"
                                  value={profile.name}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Employee ID</span>
                                <input
                                  name="employeeId"
                                  type="text"
                                  placeholder="EMP-001"
                                  value={profile.employeeId}
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
                                  placeholder="admin@mastoride.edu"
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
                                  placeholder="(260) 555-0123"
                                  value={profile.phone}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <label className="clean-field">
                              <span>Address</span>
                              <input
                                name="address"
                                type="text"
                                placeholder="123 Main Street, Fort Wayne, IN 46805"
                                value={profile.address}
                                onChange={onProfileChange}
                                disabled={!isEditing}
                              />
                            </label>
                          </div>

                          <div className="profile-group">
                            <div className="group-title">Professional Details</div>
                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Job Title</span>
                                <input
                                  name="title"
                                  type="text"
                                  placeholder="Senior System Administrator"
                                  value={profile.title}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Role</span>
                                <input
                                  name="role"
                                  type="text"
                                  placeholder="System Admin"
                                  value={profile.role}
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
                                  placeholder="Administration"
                                  value={profile.department}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Office Location</span>
                                <input
                                  name="officeLocation"
                                  type="text"
                                  placeholder="Building A, Room 101"
                                  value={profile.officeLocation}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>

                            <div className="grid-two">
                              <label className="clean-field">
                                <span>Supervisor</span>
                                <input
                                  name="supervisor"
                                  type="text"
                                  placeholder="Director Name"
                                  value={profile.supervisor}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                              <label className="clean-field">
                                <span>Join Date</span>
                                <input
                                  name="joinDate"
                                  type="date"
                                  value={profile.joinDate}
                                  onChange={onProfileChange}
                                  disabled={!isEditing}
                                />
                              </label>
                            </div>
                          </div>

                          
                          <div className="profile-group">
                            <div className="group-title">About</div>
                            <label className="clean-field">
                              <span>Bio / Notes</span>
                              <textarea
                                name="bio"
                                rows="4"
                                placeholder="Brief description or notes..."
                                value={profile.bio}
                                onChange={onProfileChange}
                                disabled={!isEditing}
                                style={{
                                  width: '100%',
                                  padding: '12px 14px',
                                  border: '1px solid #dedede',
                                  borderRadius: '12px',
                                  fontSize: '14px',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  outline: 'none'
                                }}
                              />
                            </label>
                          </div>

                          <div className="profile-actions">
                            {!isEditing ? (
                              <button 
                                className="btn" 
                                type="button" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Edit Profile button clicked! Current isEditing:', isEditing);
                                  setIsEditing(true);
                                  console.log('Set isEditing to true');
                                }}
                              >
                                Edit Profile
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
                                    setIsEditing(false);
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

                    {profileSubTab === "settings" && (
                      <section className="profile-section">
                        <header className="ud-head">
                        </header>
                        <form className="ud-form" onSubmit={onSaveSettings}>
                          <div className="setting-item">
                            <div>
                              <strong>Email Notifications</strong>
                              <p>Receive email alerts for admin events</p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={() => onToggleSetting("emailNotifications")}
                              />
                              <span />
                            </label>
                          </div>
                          <div className="setting-item">
                            <div>
                              <strong>SMS Alerts</strong>
                              <p>Get SMS for critical updates</p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={settings.smsAlerts}
                                onChange={() => onToggleSetting("smsAlerts")}
                              />
                              <span />
                            </label>
                          </div>
                          <div className="setting-item">
                            <div>
                              <strong>System Alerts</strong>
                              <p>Receive alerts for system issues</p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={settings.systemAlerts}
                                onChange={() => onToggleSetting("systemAlerts")}
                              />
                              <span />
                            </label>
                          </div>
                          <div className="setting-item">
                            <div>
                              <strong>Maintenance Mode</strong>
                              <p>Enable maintenance mode for the platform</p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={() => onToggleSetting("maintenanceMode")}
                              />
                              <span />
                            </label>
                          </div>
                          <button className="btn wide" type="submit" disabled={savingSettings}>
                            {savingSettings ? "Saving..." : "Save Settings"}
                          </button>
                        </form>
                      </section>
                    )}

                    {profileSubTab === "security" && (
                      <section className="profile-section">
                        <header className="ud-head">
                        </header>
                        <div className="security-section">
                          <div className="security-item">
                            <div className="security-icon">🔐</div>
                            <div className="security-content">
                              <h3>Change Password</h3>
                              <p>Update your admin password</p>
                              <button 
                                className="btn ghost" 
                                onClick={() => setShowPasswordModal(true)}
                              >
                                Change Password
                              </button>
                            </div>
                          </div>
                          <div className="security-item">
                            <div className="security-icon">🛡️</div>
                            <div className="security-content">
                              <h3>Two-Factor Authentication</h3>
                              <p>Add an extra layer of security</p>
                              {!is2FAEnabled ? (
                                <button 
                                  className="btn ghost" 
                                  onClick={handleEnable2FA}
                                >
                                  Enable 2FA
                                </button>
                              ) : (
                                <button 
                                  className="btn ghost" 
                                  onClick={handleDisable2FA}
                                  style={{ background: '#10b981', color: '#fff' }}
                                >
                                  ✓ 2FA Enabled
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="payment-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="payment-confirmed-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#000' }}>🔐 Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#000' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#000' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#000' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #f8a96f 0%, #f58c65 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: changingPassword ? 'not-allowed' : 'pointer',
                    opacity: changingPassword ? 0.6 : 1
                  }}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e5e5e5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: changingPassword ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Enable Modal */}
      {show2FAModal && (
        <div className="payment-overlay" onClick={() => setShow2FAModal(false)}>
          <div className="payment-confirmed-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛡️</div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: '#000' }}>Enable Two-Factor Authentication</h2>
            <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need to enter a code from your authenticator app when signing in.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={confirmEnable2FA}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #f8a96f 0%, #f58c65 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Enable 2FA
              </button>
              <button
                onClick={() => setShow2FAModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

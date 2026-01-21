import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { AuthAPI, PatientAPI } from "../../api/api";
import "../../styles/Patient.css";

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ newName: "", newEmail: "", newPassword: "", otp: "" });

  useEffect(() => {
    if (!localStorage.getItem("JWT")) { navigate("/login"); return; }
    const load = async () => {
      try {
        const u = await AuthAPI.getUser();
        const p = await PatientAPI.getMyProfile();
        setUser(u.data);
        setPatient(p.data);
      } catch { navigate("/login"); }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    if (!window.confirm("Logout?")) return;
    localStorage.clear();
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        currentEmail: user.email,
        ...(form.newName.trim() && { newName: form.newName.trim() }),
        ...(form.newEmail.trim() && { newEmail: form.newEmail.trim() }),
        ...(form.newPassword.trim() && { newPassword: form.newPassword.trim() }),
        ...(otpSent && { otp: form.otp.trim() }),
      };
      const res = await AuthAPI.updateProfile(payload);
      const message = typeof res.data === "string" ? res.data : res.data?.message;
      alert(message);
      if (message === "OTP sent") setOtpSent(true);
      if (message === "Profile updated successfully") {
        setShowForm(false); setOtpSent(false);
        const refreshed = await AuthAPI.getUser();
        setUser(refreshed.data);
      }
    } catch (err) { alert(err.response?.data || "Error"); } finally { setLoading(false); }
  };

  if (!user || !patient) return <div style={{padding: 40}}>Loading SmartMediX...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link to="/patient" className="header-logo">Smart<span>MediX</span></Link>
        <nav className="header-nav">
          <Link to="/patient" className={`nav-link ${location.pathname === "/patient" ? "active" : ""}`}>Dashboard</Link>
          <Link to="/patient/chat" className="nav-link">Chats</Link>
          <Link to="/patient/appointments" className="nav-link">Appointments</Link>
          <Link to="/patient/bills" className="nav-link">Bills</Link>
        </nav>
        <div className="header-nav">
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
            <span onClick={() => setShowForm(!showForm)} style={{color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer'}}>Settings</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showForm && (
        <div className="main-content">
          <div className="profile-box">
            <h3>Update Account Settings</h3>
            <input className="input-field" name="newName" placeholder="New Name" onChange={(e) => setForm({...form, newName: e.target.value})} />
            <input className="input-field" name="newEmail" placeholder="New Email" onChange={(e) => setForm({...form, newEmail: e.target.value})} />
            {otpSent && <input className="input-field" name="otp" placeholder="Enter OTP" onChange={(e) => setForm({...form, otp: e.target.value})} />}
            <button className="primary-btn" onClick={handleUpdateProfile} disabled={loading}>
              {otpSent ? "Verify & Update" : "Send OTP"}
            </button>
          </div>
        </div>
      )}

      <Outlet context={{ user, patient }} />
    </div>
  );
}
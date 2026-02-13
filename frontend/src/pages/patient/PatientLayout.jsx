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
    const load = async () => {
      try {
        const u = await AuthAPI.getUser();
        const p = await PatientAPI.getMyProfile();
        setUser(u.data);
        setPatient(p.data);
      } catch (err) {
        console.error("Not authenticated:", err);
        navigate("/login");
      }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    if (!window.confirm("Logout?")) return;
    
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        setForm({ newName: "", newEmail: "", newPassword: "", otp: "" });
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
            <button className="edit-profile-mini-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Edit Profile"}
            </button>         
             </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

        <main className="main-content">
          {showForm && (
          <div className="profile-box animate-fade-in">
            <h3>Update Patient Profile</h3>
            <div className="form-container">
              <input className="input-field" name="newName" placeholder="New Name" value={form.newName} onChange={handleChange} />
              <input className="input-field" name="newEmail" placeholder="New Email" value={form.newEmail} onChange={handleChange} />
              <input className="input-field" name="newPassword" type="password" placeholder="New Password" value={form.newPassword} onChange={handleChange} />
              
              {otpSent && (
                <input className="input-field" name="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} style={{border: '2px solid #3b82f6'}} />
              )}

              <button className="primary-btn" onClick={handleUpdateProfile} disabled={loading}>
                {otpSent ? "Verify OTP & Update" : "Send OTP to Update"}
              </button>
            </div>
          </div>
        )}

      <Outlet context={{ user, patient }} />
      
      </main>
    </div>
  );
}
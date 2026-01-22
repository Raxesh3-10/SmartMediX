import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { AuthAPI, DoctorAPI } from "../../api/api";
import "../../styles/Doctor.css"; // We will use the same classes here

export default function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    newName: "",
    newEmail: "",
    newPassword: "",
    otp: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("JWT")) {
      navigate("/login");
      return;
    }
    const load = async () => {
      try {
        const u = await AuthAPI.getUser();
        const d = await DoctorAPI.getMyProfile();
        setUser(u.data);
        setDoctor(d.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    if (!window.confirm("Logout?")) return;
    await AuthAPI.logout();
    localStorage.clear();
    navigate("/login");
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
      const message = typeof res.data === "string" ? res.data : res.data?.message || "Success";
      alert(message);

      if (message === "OTP sent") setOtpSent(true);
      if (message === "Profile updated successfully") {
        setShowForm(false);
        setOtpSent(false);
        setForm({ newName: "", newEmail: "", newPassword: "", otp: "" });
        const refreshed = await AuthAPI.getUser();
        setUser(refreshed.data);
      }
    } catch (err) {
      alert(err.response?.data || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !doctor) return <div className="loading-state">Loading Doctor Portal...</div>;

  return (
    <div className="dashboard-container">
      {/* HEADER - SAME AS PATIENT */}
      <header className="dashboard-header">
        <Link to="/doctor" className="header-logo">
          Smart<span>MediX</span>
        </Link>

        <nav className="header-nav">
          <Link to="/doctor" className={`nav-link ${location.pathname === "/doctor" ? "active" : ""}`}>
            Dashboard
          </Link>
          <Link to="/doctor/chat" className={`nav-link ${location.pathname === "/doctor/chat" ? "active" : ""}`}>
            Chats
          </Link>
          <Link to="/doctor/appointments" className={`nav-link ${location.pathname === "/doctor/appointments" ? "active" : ""}`}>
            Appointments
          </Link>
          <Link to="/doctor/bills" className={`nav-link ${location.pathname === "/doctor/bills" ? "active" : ""}`}>
            Bills
          </Link>

          <div className="user-meta">
            <span className="user-name">Dr. {user.name}</span>
            <span className="user-email">{user.email}</span>
            <button className="edit-profile-mini-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* CONTENT AREA */}
      <main className="main-content">
        {showForm && (
          <div className="profile-box animate-fade-in">
            <h3>Update Doctor Profile</h3>
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

        <Outlet context={{ user, doctor }} />
      </main>
    </div>
  );
}
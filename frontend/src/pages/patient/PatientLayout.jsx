import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { AuthAPI, PatientAPI } from "../../api/api";

export default function PatientLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);

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
      const u = await AuthAPI.getUser();
      const p = await PatientAPI.getMyProfile();
      setUser(u.data);
      setPatient(p.data);
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

  /* ================= SEND OTP / VERIFY OTP ================= */

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

      const message =
        typeof res.data === "string"
          ? res.data
          : res.data?.message || "Success";

      alert(message);

      if (message === "OTP sent") {
        setOtpSent(true);
      }

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

  if (!user || !patient) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* ================= TOP BAR ================= */}
      <div style={styles.topBar}>
        <div>
          <strong>{user.name}</strong>
          <div style={styles.email}>{user.email}</div>

          <button
            style={styles.editBtn}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div>
          <Link to="/patient" style={styles.link}>Dashboard</Link>
          <Link to="/patient/chat" style={styles.link}>Chats</Link>
          <Link to="/patient/appointments" style={styles.link}>Appointments</Link>
          <Link to="/patient/bills" style={styles.link}>Bills</Link>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ================= UPDATE PROFILE FORM ================= */}
      {showForm && (
        <div style={styles.formBox}>
          <h3>Update Profile</h3>

          <input
            name="newName"
            placeholder="New Name"
            value={form.newName}
            onChange={handleChange}
          />

          <input
            name="newEmail"
            placeholder="New Email"
            value={form.newEmail}
            onChange={handleChange}
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
          />

          {otpSent && (
            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
            />
          )}

          <button
            style={styles.saveBtn}
            onClick={handleUpdateProfile}
            disabled={loading}
          >
            {otpSent ? "Verify OTP & Update" : "Send OTP"}
          </button>
        </div>
      )}

      <Outlet context={{ user, patient }} />
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 40,
    maxWidth: 1300,
    margin: "auto",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 15,
    marginBottom: 30,
  },

  email: {
    fontSize: 12,
    color: "#64748b",
  },

  link: {
    marginRight: 15,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },

  logoutBtn: {
    padding: "8px 14px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  editBtn: {
    marginTop: 6,
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #cbd5f5",
    background: "#f8fafc",
    cursor: "pointer",
  },

  formBox: {
    maxWidth: 400,
    padding: 20,
    marginBottom: 30,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#ffffff",
  },

  saveBtn: {
    padding: "10px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};
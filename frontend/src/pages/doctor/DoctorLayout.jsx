import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { AuthAPI, DoctorAPI } from "../../api/api";

export default function DoctorLayout() {
  const navigate = useNavigate();

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
      const u = await AuthAPI.getUser();
      const d = await DoctorAPI.getMyProfile();
      setUser(u.data);
      setDoctor(d.data);
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


  if (!user || !doctor) return <p style={{ padding: 30 }}>Loading...</p>;

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
          <Link to="/doctor" style={styles.link}>Dashboard</Link>
          <Link to="/doctor/chat" style={styles.link}>Chats</Link>
          <Link to="/doctor/appointments" style={styles.link}>Appointments</Link>
          <Link to="/doctor/bills" style={styles.link}>Bills</Link>

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

      <Outlet context={{ user, doctor }} />
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: { padding: 40, maxWidth: 1300, margin: "auto" },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 15,
    marginBottom: 30,
  },

  email: { fontSize: 12, color: "#64748b" },

  link: { marginRight: 15, color: "#2563eb", textDecoration: "none" },

  logoutBtn: {
    padding: "8px 14px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
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
  },

  saveBtn: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
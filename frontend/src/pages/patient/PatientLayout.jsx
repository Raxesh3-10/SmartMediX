import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { AuthAPI, PatientAPI } from "../../api/api";

export default function PatientLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);

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

  if (!user || !patient) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* ===== TOP BAR ===== */}
      <div style={styles.topBar}>
        <div>
          <div>{user.name}</div>
          <div style={styles.email}>{user.email}</div>
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

      {/* ===== PAGE CONTENT ===== */}
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
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};
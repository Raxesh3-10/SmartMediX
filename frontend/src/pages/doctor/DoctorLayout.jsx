import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { AuthAPI, DoctorAPI } from "../../api/api";

export default function DoctorLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);

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

  if (!user || !doctor) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <strong>{user.name}</strong>
          <div style={styles.email}>{user.email}</div>
        </div>

        <div>
          <Link to="/doctor" style={styles.link}>Dashboard</Link>
          <Link to="/doctor/chat" style={styles.link}>Chats</Link>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <Outlet context={{ user, doctor }} />
    </div>
  );
}

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
};
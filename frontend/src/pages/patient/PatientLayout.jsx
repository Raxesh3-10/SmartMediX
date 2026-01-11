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

  if (!user || !patient) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>{user.name}</div>
        <div>
          <Link to="/patient">Dashboard</Link>
          <Link to="/patient/chat">Chats</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <Outlet context={{ user, patient }} />
    </div>
  );
}

const styles = {
  page: {
    padding: 40,
    maxWidth: 1300,
    margin: "auto",
    backgroundColor: "#f8fafc",
    fontFamily: "Arial",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: "2px solid #e5e7eb",
  },
  email: {
    fontSize: 12,
    color: "#64748b",
  },
  link: {
    marginRight: 15,
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: 500,
  },
  logoutBtn: {
    padding: "8px 14px",
    background: "#0f172a",
    color: "#fff",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
};
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/api";

function Patient() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("JWT");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("JWT");
      localStorage.removeItem("ROLE");
      navigate("/login");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Patient Dashboard</h2>
      <p>You have logged in successfully as <strong>Patient</strong>.</p>

      <button style={styles.button} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Patient;

const styles = {
  container: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    backgroundColor: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "420px",
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    borderRadius: "14px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  button: {
    marginTop: "28px",
    padding: "12px 36px",
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "#ffffff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    transition: "all 0.3s ease",
  },
};

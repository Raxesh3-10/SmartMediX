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
    padding: "40px",
    textAlign: "center",
  },
  button: {
    marginTop: "20px",
    padding: "10px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
  },
};
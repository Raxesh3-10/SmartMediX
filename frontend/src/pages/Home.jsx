import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // doctor or patient

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
    });

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome to eHealth System</h2>

        {role === "doctor" ? (
          <p style={styles.text}>
            👨‍⚕️ You are logged in as a <strong>Doctor</strong>
          </p>
        ) : (
          <p style={styles.text}>
            🧑‍⚕️ You are logged in as a <strong>Patient</strong>
          </p>
        )}

        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
    minWidth: "320px",
  },
  title: {
    color: "#0f172a",
    marginBottom: "15px",
  },
  text: {
    fontSize: "16px",
    color: "#475569",
    marginBottom: "25px",
  },
  button: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Home;

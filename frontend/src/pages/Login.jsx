import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await AuthAPI.login(form);

      const { token, role } = res.data;

      localStorage.setItem("JWT", token);
      localStorage.setItem("ROLE", role);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "DOCTOR") navigate("/doctor");
      else if (role === "PATIENT") navigate("/patient");
      else setError("Invalid user role received.");
    } catch (err) {
      const message =
        err.response?.data?.message || 
        "Invalid email or password";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Login to SmartMediX</h2>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.field}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.footerText}>
          Don’t have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

/* =====================
   Inline Styles
===================== */

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  form: {
    width: "360px",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "12px",
  },
  input: {
    padding: "8px",
    fontSize: "14px",
    marginTop: "4px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "8px",
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    marginTop: "12px",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};
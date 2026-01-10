import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../api/api";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= STEP 1: SEND OTP ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await AuthAPI.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setMessage(res.data);

      if (res.data === "OTP sent to email") {
        setStep(2);
      }
    } catch (err) {
      setMessage(err.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await AuthAPI.verifyOtp({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        otp: form.otp,
      });

      setMessage(res.data);

      if (res.data === "Signup successful") {
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form
        style={styles.form}
        onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}
      >
        <h2 style={styles.title}>Create SmartMediX Account</h2>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("successful") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}

        {/* ========== STEP 1 FORM ========== */}
        {step === 1 && (
          <>
            <div style={styles.field}>
              <label>Name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

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

            <div style={styles.field}>
              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </select>
            </div>
          </>
        )}

        {/* ========== STEP 2 OTP FORM ========== */}
        {step === 2 && (
          <div style={styles.field}>
            <label>Enter OTP</label>
            <input
              name="otp"
              required
              value={form.otp}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading
            ? "Processing..."
            : step === 1
            ? "Send OTP"
            : "Verify OTP & Signup"}
        </button>

        {step === 1 && (
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Signup;

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
    width: "380px",
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
  message: {
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "8px",
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
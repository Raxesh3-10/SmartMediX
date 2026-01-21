import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../api/api";
import "../styles/Signup.css"; // Using our new professional styles

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await AuthAPI.signup({
        name: form.name, email: form.email, password: form.password, role: form.role,
      });
      setMessage(res.data);
      if (res.data === "OTP sent to email") setStep(2);
    } catch (err) {
      setMessage(err.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await AuthAPI.verifyOtp(form);
      setMessage(res.data);
      if (res.data === "Signup successful") {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setMessage(err.response?.data || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="step-text">Step {step} of 2</span>
        <h2 className="auth-title">Create Account</h2>

        {message && (
          <div className={`status-message ${message.includes("successful") || message.includes("sent") ? 'status-success' : 'status-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" required value={form.name} onChange={handleChange} className="form-input" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} className="form-input" placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" required value={form.password} onChange={handleChange} className="form-input" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>User Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="form-select">
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input name="otp" required value={form.otp} onChange={handleChange} className="form-input" placeholder="000000" />
              <p className="auth-subtitle">Please check your email for the verification code.</p>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Processing..." : step === 1 ? "Get Verification Code" : "Verify & Complete Signup"}
          </button>
        </form>

        {step === 1 && (
          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;
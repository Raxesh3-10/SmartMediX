import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "../styles/Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const result = await response.text();
    alert(result);

    if (response.ok) {
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create Account</h2>
        <p className="tagline">Join Your Digital Healthcare System</p>

        <form onSubmit={handleSignup}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button type="submit">Signup</button>
        </form>

        {/* Login Link */}
        <p
          onClick={() => navigate("/")}
          style={{ textAlign: "center", marginTop: "15px", cursor: "pointer" }}
        >
          Already have an account? <strong>Login</strong>
        </p>
      </div>
    </div>
  );
}

export default Signup;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.text();

    if (response.ok) {
      localStorage.setItem("token", result);
      alert("Login successful");
      navigate("/home");
    } else {
      alert(result);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <p className="tagline">Your Health, One Click Away</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br /><br />

          <button type="submit">Login</button>
        </form>

        <p onClick={() => navigate("/signup")} style={{ cursor: "pointer" }}>
          New user? Signup
        </p>
      </div>
    </div>
  );

}

export default Login;

import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  // Hide navbar on routes where you may not want it later
  const hideOnRoutes = ["/doctor", "/patient", "/admin","/doctor/chat","/patient/chat"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>
          SmartMediX
        </Link>
      </div>

      <div style={styles.menu}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/login" style={styles.link}>
          Login
        </Link>
        <Link to="/signup" style={styles.link}>
          Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

/* =====================
   Simple Inline Styles
   (Replace with CSS later)
===================== */

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#0f172a",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  menu: {
    display: "flex",
    gap: "16px",
  },
  link: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "16px",
  },
};
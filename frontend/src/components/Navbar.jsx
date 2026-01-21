import { Link, useLocation } from "react-router-dom";
import "../styles/components/Navbar.css";

function Navbar() {
  const location = useLocation();

  // Optimized: Hide navbar on any route starting with doctor, patient, or admin
  const dashboardRoutes = ["/doctor", "/patient", "/admin"];
  const shouldHide = dashboardRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="main-nav">
      <div className="nav-logo">
        <Link to="/" className="nav-logo-link">
          Smart<span>MediX</span>
        </Link>
      </div>

      <div className="nav-menu">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link 
          to="/login" 
          className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
        >
          Login
        </Link>
        <Link 
          to="/signup" 
          className={`nav-link nav-signup-btn ${location.pathname === "/signup" ? "active" : ""}`}
        >
          Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
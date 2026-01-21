import { useLocation } from "react-router-dom";
import "../styles/components/Footer.css";

function Footer() {
  const location = useLocation();

  // Hide footer on dashboard-related routes to give more space to the workspace
  const dashboardRoutes = ["/doctor", "/patient", "/admin"];
  const shouldHide = dashboardRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="footer-brand">
          <h4>SmartMediX</h4>
          <p className="dev-id">© {new Date().getFullYear()} All Rights Reserved</p>
        </div>

        <div className="footer-dev-section">
          <div className="dev-card">
            <span className="dev-label">Lead Developer</span>
            <span className="dev-name">Parmar Raxesh</span>
            <span className="dev-id">Roll No: CE121</span>
            <br />
            <a href="mailto:goturaxesh@gmail.com" className="footer-link">
              goturaxesh@gmail.com
            </a>
          </div>

          <div className="dev-card">
            <span className="dev-label">Co-Developer</span>
            <span className="dev-name">Rathod Ronak</span>
            <span className="dev-id">Roll No: CE138</span>
            <br />
            <a href="mailto:ronakrathod202@gmail.com" className="footer-link">
              ronakrathod202@gmail.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
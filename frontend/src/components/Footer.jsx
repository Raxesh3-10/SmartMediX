import { useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  // Hide footer on role-based dashboards
  const hideOnRoutes = ["/doctor", "/patient", "/admin","/doctor/chat","/patient/chat"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          © {new Date().getFullYear()} SmartMediX
        </div>

        <div style={styles.center}>
          Developed by
        </div>

        <div style={styles.right}>
          <div>
            <strong>Parmar Raxesh</strong> (CE121) <br />
            <a href="mailto:goturaxesh@gmail.com" style={styles.link}>
              goturaxesh@gmail.com
            </a>
          </div>

          <div style={{ marginTop: "8px" }}>
            <strong>Rathod Ronak</strong> (CE134) <br />
            <a href="mailto:ronakrathod202@gmail.com" style={styles.link}>
              ronakrathod202@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

/* =====================
   Inline Styles
===================== */

const styles = {
  footer: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "16px 24px",
    marginTop: "auto",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },
  left: {
    fontSize: "14px",
  },
  center: {
    fontSize: "14px",
    fontWeight: "500",
  },
  right: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  link: {
    color: "#93c5fd",
    textDecoration: "none",
  },
};
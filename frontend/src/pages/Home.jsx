import { Link } from "react-router-dom";
import smartMediXLogo from "../assets/smartMediX.png"; // add image in assets folder

function Home() {
  return (
    <div style={styles.container}>
      {/* ================= HERO SECTION ================= */}
      <section style={styles.hero}>
        <img
          src={smartMediXLogo}
          alt="SmartMediX Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>SmartMediX</h1>
        <p style={styles.subtitle}>
          Smart, Next-Generation Medical & Healthcare System
        </p>

        <p style={styles.description}>
          SmartMediX is a secure e-Healthcare platform that enables online medical
          consultations, appointment scheduling, digital prescriptions, billing,
          and patient history management through a modern web interface.
        </p>

        <div style={styles.actions}>
          <Link to="/login" style={styles.primaryBtn}>
            Login
          </Link>
          <Link to="/signup" style={styles.secondaryBtn}>
            Signup
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Key Features</h2>

        <ul style={styles.list}>
          <li>User Registration & OTP / Password-based Authentication</li>
          <li>Online Video Consultation with Doctors</li>
          <li>Appointment Scheduling & Virtual Waiting Room (Token System)</li>
          <li>Secure Chat with File Exchange & Text-to-Speech</li>
          <li>Patient Medical History & Doctor Notes Storage</li>
          <li>Online Payments, Billing & Invoice Generation</li>
          <li>Medicine Reminder & Refill Alerts</li>
          <li>Rule-Based Doctor Recommendation System</li>
          <li>Family Health Account Management</li>
          <li>Auto-Logout & Secure Session Management</li>
        </ul>
      </section>

      {/* ================= USERS ================= */}
      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Who Can Use SmartMediX?</h2>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Patients</h3>
            <p>
              Book appointments, consult doctors online, manage medical history,
              receive reminders, and access prescriptions securely.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Doctors</h3>
            <p>
              Manage availability, consult patients via video/chat, access
              authorized medical records, and issue digital prescriptions.
            </p>
          </div>

          <div style={styles.card}>
            <h3>Administrators</h3>
            <p>
              Monitor users, manage sessions, handle billing issues, refunds,
              and ensure system security and availability.
            </p>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURE ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>System Architecture</h2>
        <p style={styles.archText}>
          SmartMediX follows a service-oriented microservice architecture.
          The frontend is built using React, while the backend consists of
          Spring Boot microservices communicating via REST APIs.
          MongoDB is used for secure and scalable data storage, with optional
          AI services integrated separately in the future.
        </p>
      </section>
    </div>
  );
}

export default Home;

/* =====================
   Inline Styles
===================== */

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f8fafc",
  },
  logo: {
    width: "500px",
    marginBottom: "80px",
  },
  title: {
    fontSize: "36px",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#475569",
    marginBottom: "16px",
  },
  description: {
    maxWidth: "700px",
    margin: "0 auto 24px",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  primaryBtn: {
    padding: "10px 24px",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "4px",
  },
  secondaryBtn: {
    padding: "10px 24px",
    border: "1px solid #0f172a",
    color: "#0f172a",
    textDecoration: "none",
    borderRadius: "4px",
  },
  section: {
    padding: "40px 20px",
  },
  sectionAlt: {
    padding: "40px 20px",
    backgroundColor: "#f1f5f9",
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: "24px",
  },
  list: {
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: "1.8",
  },
  cards: {
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    width: "280px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  archText: {
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: "1.6",
    textAlign: "center",
  },
};
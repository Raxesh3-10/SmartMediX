import { Link } from "react-router-dom";
import smartMediXLogo from "../assets/smartMediX.png";
import "../styles/Home.css"; // Importing our new styles

function Home() {
  const features = [
    "User Registration & OTP Auth",
    "Online Video Consultation",
    "Virtual Waiting Room",
    "Secure File Exchange",
    "Medical History Storage",
    "Online Billing & Invoices",
    "Doctor Recommendations",
    "Family Health Accounts"
  ];

  return (
    <div className="home-container">
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <img src={smartMediXLogo} alt="SmartMediX Logo" className="logo-main" />
        <h1 className="title-main">SmartMediX</h1>
        <p className="subtitle-main">Smart, Next-Generation Medical & Healthcare System</p>
        <p className="description-main">
          A secure e-Healthcare platform enabling seamless communication between 
          patients and providers through digital prescriptions, virtual visits, 
          and integrated history management.
        </p>

        <div className="btn-group">
          <Link to="/login" className="btn btn-primary">Login to Portal</Link>
          <Link to="/signup" className="btn btn-secondary">Create Account</Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="section">
        <h2 className="section-title">Key Platform Features</h2>
        <ul className="features-grid">
          {features.map((feature, index) => (
            <li key={index} className="feature-item">{feature}</li>
          ))}
        </ul>
      </section>

      {/* ================= USERS ================= */}
      <section className="section section-alt">
        <h2 className="section-title">Who is it for?</h2>
        <div className="user-cards-container">
          <div className="user-card">
            <h3>Patients</h3>
            <p>Book appointments, consult doctors online, and access your medical history securely from any device.</p>
          </div>
          <div className="user-card">
            <h3>Doctors</h3>
            <p>Manage your practice, issue digital prescriptions, and provide care via high-quality video consultations.</p>
          </div>
          <div className="user-card">
            <h3>Administrators</h3>
            <p>Oversee system health, manage secure sessions, and ensure data integrity across the platform.</p>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURE ================= */}
      <section className="section">
        <div className="arch-card">
          <h2 className="section-title">System Architecture</h2>
          <p>
            SmartMediX is powered by a <strong>Spring Boot Microservices</strong> backend and 
            a <strong>React</strong> frontend. Our service-oriented architecture ensures 
            that patient data is stored securely in <strong>MongoDB</strong> with high availability.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
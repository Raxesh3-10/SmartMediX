import { Link } from "react-router-dom";
import smartMediXLogo from "../assets/smartMediX.png";
import "../styles/Home.css";

function Home() {

  const objectives = [
    "Online appointment booking with doctors",
    "Secure video consultation using WebRTC",
    "AI-assisted medical history storage",
    "End-to-end encrypted doctor–patient chat",
    "Virtual waiting room with token system",
    "Secure healthcare data management",
    "Doctor report PDF generation"
  ];

  const systemFeatures = [
    "User Registration with OTP & JWT Authentication",
    "Online Video Consultation (WebRTC / Jitsi)",
    "Real-time Doctor–Patient Chat",
    "Virtual Waiting Room Token System",
    "Secure Medical History Storage",
    "File Exchange for Reports & Prescriptions",
    "AI Chatbot Doctor Recommendation",
    "Online Billing and Invoice Generation"
  ];

  const techStack = [
    { name: "Frontend", value: "ReactJS" },
    { name: "Backend", value: "Spring Boot (Java Microservices)" },
    { name: "Database", value: "MongoDB" },
    { name: "Authentication", value: "JWT + OTP" },
    { name: "Video Consultation", value: " Jitsi" },
    { name: "File Storage", value: "Cloudinary" },
    { name: "Deployment", value: "Render platform (using Docker)" },
    { name: "Load Balancer", value: "HAProxy" }
  ];

  return (
    <div className="home-container">

      {/* HERO SECTION */}
      <section className="hero-section">
        <img src={smartMediXLogo} alt="SmartMediX Logo" className="logo-main" />
        <h1 className="title-main">SmartMediX</h1>

        <p className="subtitle-main">
          Smart Next-Generation Digital Healthcare Platform
        </p>

        <p className="description-main">
          SmartMediX is a modern e-Healthcare system that connects patients and doctors 
          through a secure digital platform. It provides online consultations, medical 
          record management, appointment scheduling, and AI-assisted healthcare guidance.
        </p>

        <div className="btn-group">
          <Link to="/login" className="btn btn-primary">Login Portal</Link>
          <Link to="/signup" className="btn btn-secondary">Create Account</Link>
        </div>
      </section>

      {/* BACKGROUND / PROBLEM */}
      <section className="section">
        <h2 className="section-title">Healthcare Challenges</h2>

        <div className="info-card">
          <p>
            Traditional healthcare systems face several problems including difficulty 
            accessing doctors, long waiting queues in hospitals, and poor management 
            of patient medical records. Patients often struggle to consult doctors 
            remotely, while doctors face challenges managing appointments and patient 
            communication efficiently.
          </p>

          <p>
            SmartMediX solves these issues by providing a centralized digital platform 
            for online consultations, secure medical record storage, appointment 
            scheduling, and real-time communication between doctors and patients.
          </p>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="section section-alt">
        <h2 className="section-title">System Objectives</h2>

        <ul className="features-grid">
          {objectives.map((item, index) => (
            <li key={index} className="feature-item">{item}</li>
          ))}
        </ul>
      </section>

      {/* SYSTEM SCOPE */}
      <section className="section">
        <h2 className="section-title">Scope of the System</h2>

        <div className="user-cards-container">
          <div className="user-card">
            <h3>Patient Portal</h3>
            <p>
              Patients can book doctor appointments, attend video consultations,
              chat with doctors, and  access their medical history.
            </p>
          </div>

          <div className="user-card">
            <h3>Doctor Portal</h3>
            <p>
              Doctors can manage patient appointments, provide digital consultations,
              generate prescriptions, and access medical records.
            </p>
          </div>

          <div className="user-card">
            <h3>Admin Management</h3>
            <p>
              Administrators monitor system operations, manage users,
              and ensure data integrity and platform security.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTEM FEATURES */}
      <section className="section section-alt">
        <h2 className="section-title">Core System Features</h2>

        <ul className="features-grid">
          {systemFeatures.map((feature, index) => (
            <li key={index} className="feature-item">{feature}</li>
          ))}
        </ul>
      </section>

      {/* TECHNOLOGY STACK */}
      <section className="section">
        <h2 className="section-title">Technology Stack</h2>

        
          {techStack.map((tech, index) => (
            <div key={index} className="tech-item">
              <h2>{tech.name}:</h2> {tech.value}
            </div>
          ))}
        
      </section>

      {/* ARCHITECTURE */}
      <section className="section section-alt">
        <div className="arch-card">
          <h2 className="section-title">System Architecture</h2>

          <p>
            SmartMediX follows a microservices architecture where different services
            handle authentication, appointments, chat, and file storage.
          </p>

          <p>
            The frontend React application communicates with backend APIs built
            using Spring Boot microservices. Healthcare data is stored securely
            in MongoDB, while files and medical reports are stored using
            Cloudinary cloud storage.
          </p>

          <p>
            The platform is deployed using Docker containers with HAProxy
            load balancing to ensure scalability, reliability, and high availability.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Home;
# SmartMediX
Smart, Next-Generation Medical & Healthcare System

## 📌 Overview
SmartMediX is a modern digital healthcare platform that connects patients and doctors through a unified web-based system. It enables online consultations, secure medical record management, real-time communication, and AI-assisted healthcare guidance.

The system is designed to reduce traditional healthcare challenges such as long waiting times, inefficient record handling, and limited accessibility to doctors.

---

## 🚀 Features

- 👨‍⚕️ **Doctor-Patient Interaction**
  - Real-time chat system
  - Video consultation (WebRTC / Jitsi)

- 📅 **Appointment Management**
  - Book appointments based on availability
  - Virtual waiting room with token system

- 📁 **Medical Records**
  - Secure storage of reports and prescriptions
  - AI-generated medical summaries

- 🤖 **AI Chatbot**
  - Doctor recommendation
  - Health guidance using LLM APIs (OpenRouter)

- 🔐 **Authentication & Security**
  - JWT-based authentication
  - OTP login system
  - Role-based access control (Patient / Doctor / Admin)

- 📄 **Reports**
  - PDF generation for doctor earnings and appointments

---

## 🏗️ Architecture

### Current System
- Monolithic Spring Boot backend
- Load balanced using HAProxy
- Docker-based deployment

### Future Upgrade
- Migration to Microservices Architecture
- Pub-Sub messaging system (Kafka / Redis)
- Cloud deployment on AWS with Kubernetes
- Custom AI chatbot (domain-trained model)

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | ReactJS |
| Backend     | Spring Boot (Java) |
| Database    | MongoDB |
| Auth        | JWT + OTP |
| Video       | WebRTC / Jitsi |
| Storage     | Cloudinary |
| Deployment  | Docker + HAProxy |
| AI          | OpenRouter API (LLM) |

---

## ⚙️ System Modules

- Authentication Service
- User Management (Patient / Doctor / Admin)
- Appointment Service
- Chat Service
- Medical Records Service
- Billing Service
- File Upload Service

---

## 📊 Non-Functional Highlights

- ⚡ High performance using load balancing
- 🔒 Secure data handling with encryption & JWT
- 📈 Scalable with containerized deployment
- 🛡️ Fault-tolerant architecture
- 🔄 Stateless backend design

---

## 🌍 Future Enhancements

- Microservices-based architecture
- Real-time pub-sub communication system
- AWS cloud deployment with auto-scaling
- Custom-trained AI healthcare chatbot
- Wearable device integration (IoT)
- Mobile application (Android/iOS)
- Online pharmacy & lab integration

---

## 👨‍💻 Authors

- Raxesh Parmar  
- Ronak Rathod  

B.Tech Computer Engineering  
Dharmsinh Desai University

---

## 📚 References

Refer to the project report for detailed academic references and documentation.

---

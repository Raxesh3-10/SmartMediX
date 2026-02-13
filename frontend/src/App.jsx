import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";

import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorChatPage from "./pages/doctor/DoctorChatPage";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorBillsPage from "./pages/doctor/DoctorBillsPage";
import PatientLayout from "./pages/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientChatPage from "./pages/patient/PatientChatPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientBillsPage from "./pages/patient/PatientBillsPage";
import PatientBookingPage from "./pages/patient/PatientBookingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="chat" element={<DoctorChatPage />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="bills" element={<DoctorBillsPage />} />
        </Route>

        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="chat" element={<PatientChatPage />} />
          <Route path="appointments" element={<PatientAppointmentsPage />} />
          <Route path="bills" element={<PatientBillsPage />} />
          <Route path="booking" element={<PatientBookingPage />} />
        </Route>

        <Route path="/admin" element={<Admin />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
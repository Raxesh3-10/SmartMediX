import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI, PaymentAPI } from "../../api/api";
import JitsiMeeting from "../../components/JitsiMeeting";
import FamilyAppointmentsSection from "../../components/FamilyAppointmentsSection";
import "../../styles/Patient.css";

/* ================= CONSTANTS ================= */
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const CACHE_PATIENT_APPOINTMENTS = "cache_patient_appointments";
const CACHE_PATIENT_DOCTORS = "cache_patient_doctors";

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const formatCountdown = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00 : 00 : 00";
  const mins = Math.floor(seconds / 60);
  const days = Math.floor(mins / (24 * 60));
  const hours = Math.floor((mins % (24 * 60)) / 60);
  const minutes = mins % 60;
  return `${String(days).padStart(2, "0")} : ${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")}`;
};

const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

/* ================= COMPONENT ================= */
export default function PatientAppointmentsPage() {
  const { patient } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [familyAppointments, setFamilyAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!patient) return;
    loadAppointments();
    loadDoctors();
  }, [patient]);

const loadAppointments = async (force = false) => {
  try {
    setRefreshing(true);

    if (!force) {
      const cached = localStorage.getItem(CACHE_PATIENT_APPOINTMENTS);
      if (cached) {
        const data = JSON.parse(cached);
        setAppointments(data.filter(a => a.isPrimaryPatient));
        setFamilyAppointments(data.filter(a => !a.isPrimaryPatient));
        setRefreshing(false);
        return;
      }
    }

    const res = await AppointmentAPI.getPatientAppointments(
      patient.patientId
    );

    localStorage.setItem(
      CACHE_PATIENT_APPOINTMENTS,
      JSON.stringify(res.data)
    );

    setAppointments(res.data.filter(a => a.isPrimaryPatient));
    setFamilyAppointments(res.data.filter(a => !a.isPrimaryPatient));
  } catch (err) {
    console.error("Failed to load appointments", err);
  } finally {
    setRefreshing(false);
  }
};

const loadDoctors = async (force = false) => {
  try {
    if (!force) {
      const cached = localStorage.getItem(CACHE_PATIENT_DOCTORS);
      if (cached) {
        setDoctors(JSON.parse(cached));
        return;
      }
    }

    const res = await AppointmentAPI.getPatientDoctors(
      patient.patientId
    );

    setDoctors(res.data);
    localStorage.setItem(
      CACHE_PATIENT_DOCTORS,
      JSON.stringify(res.data)
    );
  } catch (err) {
    console.error("Failed to load doctors", err);
  }
};


  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) =>
      `${a.user?.name ?? ""} ${a.user?.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [appointments, search]);

  useEffect(() => {
    if (!selectedAppt) { setTimeLeft(0); return; }
    const interval = setInterval(() => {
      const { appointment } = selectedAppt;
      if (!appointment?.startTime) { setTimeLeft(0); return; }
      const baseDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : new Date();
      const [h, m] = appointment.startTime.split(":").map(Number);
      const startIST = new Date(baseDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      startIST.setHours(h, m, 0, 0);
      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const diffSeconds = Math.floor((startIST.getTime() - nowIST.getTime()) / 1000);
      setTimeLeft(Math.max(0, diffSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAppt]);

  useEffect(() => {
    if (!callStarted || !selectedAppt) return;
    const interval = setInterval(() => {
      const latest = appointments.find(a => a.appointment.appointmentId === selectedAppt.appointment.appointmentId);
      if (latest?.appointment.status === "COMPLETED") {
        alert("Consultation ended by doctor");
        setCallStarted(false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [callStarted, selectedAppt, appointments]);

const saveAppointment = async (isUpdate) => {
  if (!selectedDoctor || !selectedSlotKey) {
    alert("Select a slot first");
    return;
  }

  const slot = selectedDoctor.slots.find(
    s => slotKey(s) === selectedSlotKey
  );
  if (!slot) return;

  try {
    let updatedAppointments;

    if (!isUpdate) {
      const res = await AppointmentAPI.createAppointment({
        patientId: patient.patientId,
        doctorId: selectedDoctor.doctor.doctorId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        appointmentDate: new Date().toISOString(),
        conferenceType: "VIDEO",
      });

      await PaymentAPI.payForAppointment(res.data._id);

      updatedAppointments = [
        ...(appointments || []),
        res.data,
      ];

      alert("Appointment booked");
    } else {
      await AppointmentAPI.updateAppointment(
        selectedAppt.appointment.appointmentId,
        slot
      );

      updatedAppointments = appointments.map(a =>
        a.appointment.appointmentId ===
        selectedAppt.appointment.appointmentId
          ? {
              ...a,
              appointment: {
                ...a.appointment,
                ...slot,
              },
            }
          : a
      );

      alert("Appointment updated");
    }

    localStorage.setItem(
      CACHE_PATIENT_APPOINTMENTS,
      JSON.stringify(updatedAppointments)
    );

    setAppointments(
      updatedAppointments.filter(a => a.isPrimaryPatient)
    );
    setFamilyAppointments(
      updatedAppointments.filter(a => !a.isPrimaryPatient)
    );

    setSelectedSlotKey(null);
  } catch {
    alert("Action failed");
  }
};

  return (
    <main className="main-content">
      {/* FAMILY SECTION */}
      <div className="profile-box">
        <FamilyAppointmentsSection familyAppointments={familyAppointments} currentPatient={patient} />
      </div>

      {/* MY APPOINTMENTS SECTION */}
      <div className="profile-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3>My Scheduled Consultations</h3>

  <button
    className="refresh-btn"
    disabled={refreshing}
    onClick={async () => {
      localStorage.removeItem(CACHE_PATIENT_APPOINTMENTS);
      localStorage.removeItem(CACHE_PATIENT_DOCTORS);

      await loadAppointments(true);
      await loadDoctors(true);
    }}
  >
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

        <input
          className="input-field"
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="appointment-list">
          {filteredAppointments.map((a) => (
            <div
              key={a.appointment.appointmentId}
              className={`record-card appointment-item ${selectedAppt?.appointment?.appointmentId === a.appointment.appointmentId ? "active-selection" : ""}`}
              onClick={() => {
                setSelectedAppt(a);
                setSelectedDoctor(doctors.find(d => d.doctor.doctorId === a.appointment.doctorId));
                setCallStarted(false);
              }}
            >
              <div className="appt-info">
                <strong>Dr. {a.user?.name}</strong>
                <div className="doctor-subtext">{a.user?.email}</div>
                <div className="appt-meta">
                  <span>📅 {formatDate(a.appointment.appointmentDate)}</span>
                  <span>⏰ {a.appointment.startTime} - {a.appointment.endTime}</span>
                </div>
              </div>
              <div className={`status-badge ${a.appointment.status.toLowerCase()}`}>
                {a.appointment.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE CALL / ROOM DETAILS */}
      {selectedAppt && selectedAppt.appointment.roomId && selectedAppt.appointment.status === "CREATED" && (
        <div className="profile-box call-section">
          <div className="timer-wrapper">
            <span>Consultation Starts In:</span>
            <span className="countdown-timer">{formatCountdown(timeLeft)}</span>
          </div>
          
          <div className="room-id-box">
            <div className="room-label">Room ID: <code>{selectedAppt.appointment.roomId}</code></div>
            <button className="copy-btn" onClick={() => {
              navigator.clipboard.writeText(selectedAppt.appointment.roomId);
              alert("Room ID copied");
            }}>Copy</button>
          </div>

          {!callStarted ? (
            <button className="primary-btn call-btn" onClick={() => setCallStarted(true)}>Join Video Consultation</button>
          ) : (
            <div className="video-container">
              <button className="danger-btn" onClick={() => setCallStarted(false)}>Leave Meeting</button>
              <JitsiMeeting
                roomId={selectedAppt.appointment.roomId}
                displayName={patient.name}
                email={patient.email}
                role="PATIENT"
                onClose={() => setCallStarted(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* BOOKING SECTION */}
            <div className="profile-box">
              <h3 style={{ marginBottom: '20px' }}>Book New Consultation</h3>
              
              {/* Step 1: Doctor Selection Grid (Visible when no doctor is selected) */}
              {!selectedDoctor ? (
                <div className="booking-wizard">
                  <p className="helper-text">Step 1: Choose your Specialist</p>
                  <div className="doctor-selection-grid">
                    {doctors.map((d) => (
                      <div key={d.doctor.doctorId} className="doctor-card">
                        <div className="doctor-avatar">
                          {d.user?.name?.charAt(0)}
                        </div>
                        <div className="doctor-card-info">
                          <h4>Dr. {d.user?.name}</h4>
                          <p>{d.user?.email}</p>
                          <button 
                            className="select-doc-btn"
                            onClick={() => {
                              setSelectedDoctor(d);
                              setSelectedSlotKey(null); // Reset slots when picking new doc
                            }}
                          >
                            Select Doctor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step 2: Slot Selection (Visible after a doctor is selected) */
                <div className="slot-booking-area animate-fade-in">
                  <div className="selection-header-card">
                    <div className="selected-doc-profile">
                      <div className="mini-avatar">{selectedDoctor.user?.name?.charAt(0)}</div>
                      <div>
                        <h4 style={{ margin: 0 }}>Dr. {selectedDoctor.user?.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{selectedDoctor.user?.email}</p>
                      </div>
                    </div>
                    <button 
                      className="unselect-btn" 
                      onClick={() => {
                        setSelectedDoctor(null);
                        setSelectedSlotKey(null);
                      }}
                    >
                      ✕ Unselect Doctor
                    </button>
                  </div>

                  <p className="helper-text" style={{ marginTop: '20px' }}>Step 2: Pick an available time slot</p>
                  
                  {renderSlotGrid(selectedDoctor, selectedSlotKey, setSelectedSlotKey)}
                  
                  <div className="booking-actions">
                    <button 
                      className="primary-btn confirm-booking-btn" 
                      disabled={!selectedSlotKey}
                      onClick={() => saveAppointment(!!selectedAppt)}
                    >
                      {selectedAppt ? "Confirm Reschedule" : "Confirm & Pay Now"}
                    </button>
                  </div>
                </div>
              )}
            </div>
    </main>
  );
}

/* ================= SLOT GRID FUNCTION ================= */
function renderSlotGrid(doctor, selectedSlotKey, setSelectedSlotKey) {
  return (
    <div className="slot-grid-container">
      {DAYS.map((day) => (
        <div key={day} className="day-column">
          <div className="day-header">{day.substring(0, 3)}</div>
          <div className="slots-list">
            {(doctor.slots || []).filter((s) => s.day === day).map((s) => {
              const key = slotKey(s);
              const isBooked = s.booked;
              const isSelected = selectedSlotKey === key;
              return (
                <div
                  key={key}
                  className={`slot-pill ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => !isBooked && setSelectedSlotKey(key)}
                >
                  {s.startTime} - {s.endTime}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
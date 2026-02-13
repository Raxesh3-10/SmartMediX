import { useEffect, useState, useMemo } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
// ADDED: MedicalRecordsAPI to the import
import { AppointmentAPI, PaymentAPI, MedicalRecordsAPI } from "../../api/api";
import "../../styles/Patient.css"; 

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

export default function PatientBookingPage() {
  const { patient } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [search, setSearch] = useState("");

  // === NEW: Capture AI Diagnosis from Chatbot ===
  const [aiDiagnosis, setAiDiagnosis] = useState("Self-booked consultation");

  // 1. Load Doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await AppointmentAPI.getPatientDoctors(patient.patientId);
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    };
    if (patient) loadDoctors();
  }, [patient]);

  // 2. Handle Auto-Fill from Chatbot
  useEffect(() => {
    if (location.state) {
        // Filter by specialty if provided
        if (location.state.filterSpecialty) {
            setSearch(location.state.filterSpecialty);
        }
        // Capture the AI diagnosis if provided
        if (location.state.aiDiagnosis) {
            setAiDiagnosis(location.state.aiDiagnosis);
        }
    }
  }, [location.state]);

  // 3. Filter Logic
  const filteredDoctors = useMemo(() => {
    if (!search) return doctors;
    const term = search.toLowerCase();
    return doctors.filter(d => 
        d.user.name.toLowerCase().includes(term) || 
        d.doctor.specialization.toLowerCase().includes(term)
    );
  }, [doctors, search]);

  // 4. Booking Logic (UPDATED)
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedSlotKey) return;

    const slot = selectedDoctor.slots.find(s => slotKey(s) === selectedSlotKey);
    if (!slot) return;

    try {
      // A. Create Appointment
      const res = await AppointmentAPI.createAppointment({
        patientId: patient.patientId,
        doctorId: selectedDoctor.doctor.doctorId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        appointmentDate: new Date().toISOString(),
        conferenceType: "VIDEO",
      });

      const appointmentId = res.data._id; // Assuming API returns the created object with _id

      // B. Process Payment
      await PaymentAPI.payForAppointment(appointmentId);

      // C. (NEW) Generate Medical History from AI Diagnosis
      // This saves the chatbot's finding as the initial medical record
      await MedicalRecordsAPI.generateReport({
          patientId: patient.patientId,
          appointmentId: appointmentId,
          diagnosis: `AI BOT PRELIMINARY DIAGNOSIS: ${aiDiagnosis}`, 
          prescription: "Pending Doctor Review", // Default placeholder
          fileUrls: [] 
      });

      alert("Appointment booked & AI Diagnosis saved successfully!");
      navigate("/patient/appointments"); 

    } catch (error) {
      console.error("Booking workflow failed", error);
      alert("Failed to complete booking. Please check your network.");
    }
  };

  return (
    <main className="main-content">
      <div className="profile-box">
        {/* Header with Back Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>
             {location.state?.filterSpecialty 
                ? `Recommended: ${location.state.filterSpecialty}` 
                : "Book New Consultation"}
          </h3>
          <button 
            className="secondary-btn" 
            onClick={() => navigate("/patient/appointments")}
            style={{ fontSize: "0.9rem", padding: "5px 15px" }}
          >
            ← Back To Appointments
          </button>
        </div>

        {/* Display AI Note if available */}
        {aiDiagnosis && aiDiagnosis !== "Self-booked consultation" && (
            <div style={{backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bae6fd'}}>
                <small style={{color: '#0369a1', fontWeight: 'bold'}}>AI NOTE:</small>
                <p style={{margin: '5px 0', fontSize: '0.9rem', color: '#0c4a6e'}}>"{aiDiagnosis}"</p>
                <small style={{color: '#64748b'}}>This will be sent to the doctor automatically.</small>
            </div>
        )}

        {/* Search Bar */}
        <input
          className="input-field"
          placeholder="Search Doctor or Specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "20px" }}
        />

        {/* === STEP 1: DOCTOR SELECTION === */}
        {!selectedDoctor ? (
          <div className="booking-wizard animate-fade-in">
             <p className="helper-text">Step 1: Choose your Specialist</p>
            <div className="doctor-selection-grid">
              {filteredDoctors.length > 0 ? filteredDoctors.map((d) => (
                <div key={d.doctor.doctorId} className="doctor-card">
                  <div className="doctor-avatar">
                    {d.user?.name?.charAt(0)}
                  </div>
                  <div className="doctor-card-info">
                    <h4>Dr. {d.user?.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9em' }}>{d.doctor.specialization}</p>
                    <button 
                      className="select-doc-btn"
                      onClick={() => {
                        setSelectedDoctor(d);
                        setSelectedSlotKey(null);
                      }}
                    >
                      Select Doctor
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "20px", width: "100%", textAlign: "center", gridColumn: "1 / -1" }}>
                   <p>No specialists found for "{search}".</p>
                   <button className="text-btn" onClick={() => setSearch("")}>Show all doctors</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* === STEP 2: SLOT SELECTION === */
          <div className="slot-booking-area animate-fade-in">
            <div className="selection-header-card">
              <div className="selected-doc-profile">
                <div className="mini-avatar">{selectedDoctor.user?.name?.charAt(0)}</div>
                <div>
                  <h4 style={{ margin: 0 }}>Dr. {selectedDoctor.user?.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedDoctor.doctor.specialization}
                  </p>
                </div>
              </div>
              <button 
                className="unselect-btn" 
                onClick={() => {
                  setSelectedDoctor(null);
                  setSelectedSlotKey(null);
                }}
              >
                ✕ Change Doctor
              </button>
            </div>

            <p className="helper-text" style={{ marginTop: '20px' }}>Step 2: Pick an available time slot</p>
            
            {renderSlotGrid(selectedDoctor, selectedSlotKey, setSelectedSlotKey)}
            
            <div className="booking-actions">
              <button 
                className="primary-btn confirm-booking-btn" 
                disabled={!selectedSlotKey}
                onClick={handleBooking}
              >
                Confirm & Pay Now
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper function to render the days and slots
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
             {!(doctor.slots || []).some(s => s.day === day) && <div className="no-slots">-</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI } from "../../api/api";
import JitsiMeeting from "../../components/JitsiMeeting";
import "../../styles/Doctor.css"; // We will use the same classes here

/* ================= CONSTANTS ================= */
const CALL_BUFFER_SECONDS = 10 * 60;
const CACHE_DOCTOR_APPOINTMENTS = "cache_doctor_appointments";

/* ================= HELPERS ================= */
const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCountdown = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0)
    return "00 : 00 : 00";

  const mins = Math.floor(seconds / 60);
  const days = Math.floor(mins / (24 * 60));
  const hours = Math.floor((mins % (24 * 60)) / 60);
  const minutes = mins % 60;

  return `${String(days).padStart(2, "0")} : ${String(hours).padStart(
    2,
    "0"
  )} : ${String(minutes).padStart(2, "0")}`;
};

export default function DoctorAppointmentsPage() {
  const { doctor } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!doctor) return;
    loadAppointments();
  }, [doctor]);

const loadAppointments = async (force = false) => {
  try {
    setRefreshing(true);

    if (!force) {
      const cached = localStorage.getItem(CACHE_DOCTOR_APPOINTMENTS);
      if (cached) {
        setAppointments(JSON.parse(cached));
        setRefreshing(false);
        return;
      }
    }

    const res = await AppointmentAPI.getDoctorAppointments(
      doctor.doctorId
    );

    setAppointments(res.data);
    localStorage.setItem(
      CACHE_DOCTOR_APPOINTMENTS,
      JSON.stringify(res.data)
    );
  } catch (err) {
    console.error("Failed to load appointments", err);
  } finally {
    setRefreshing(false);
  }
};

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    return appointments.filter((a) =>
      `${a.user.name} ${a.user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!selectedAppt) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const { appointment } = selectedAppt;
      if (!appointment?.startTime) {
        setTimeLeft(0);
        return;
      }

      const baseDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate)
        : new Date();

      const [h, m] = appointment.startTime.split(":").map(Number);

      const startIST = new Date(
        baseDate.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })
      );
      startIST.setHours(h, m, 0, 0);

      const nowIST = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })
      );

      const diffSeconds = Math.floor(
        (startIST.getTime() - nowIST.getTime()) / 1000
      );

      setTimeLeft(Math.max(0, diffSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAppt]);

  return (
    <div className="main-content">
      <div className="profile-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3>Doctor Appointments</h3>
  <button
    className="refresh-btn"
    onClick={() => {
      localStorage.removeItem(CACHE_DOCTOR_APPOINTMENTS);
      loadAppointments(true);
    }}
    disabled={refreshing}
  >
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

        
        {/* Unified Search Input */}
        <input
          className="input-field"
          placeholder="Search patient by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: "20px" }}
        />

        {/* Appointment List */}
        <div className="appointments-list-container">
          {filtered.length > 0 ? (
            filtered.map((a) => {
              const isSelected = selectedAppt?.appointment?.appointmentId === a.appointment.appointmentId;
              return (
                <div
                  key={a.appointment.appointmentId}
                  className={`record-card appointment-item ${isSelected ? "active" : ""}`}
                  onClick={() => {
                    setSelectedAppt(a);
                    setCallStarted(false);
                  }}
                  style={{ cursor: "pointer", marginBottom: "10px" }}
                >
                  <div className="record-details">
                    <strong style={{ fontSize: "1.1rem", color: "#1e293b" }}>{a.user.name}</strong>
                    <div className="record-meta" style={{ color: "#64748b", margin: "4px 0" }}>{a.user.email}</div>
                    <div className="record-meta">
                      📅 {formatDate(a.appointment.appointmentDate)} | 🕒 {a.appointment.startTime} – {a.appointment.endTime}
                    </div>
                  </div>
                  <div className="status-badge-container">
                    <span className={`status-badge ${a.appointment.status.toLowerCase()}`}>
                      {a.appointment.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-msg">No appointments found matching your search.</p>
          )}
        </div>
      </div>

      {/* CALL SECTION */}
      {selectedAppt && selectedAppt.appointment.status === "CREATED" && (
        <div className="profile-box animate-fade-in" style={{ borderTop: "4px solid #2563eb" }}>
          <div className="call-header">
            <h3>Consultation with {selectedAppt.user.name}</h3>
            <div className="timer-box">
              Starts in: <span className="timer-countdown">{formatCountdown(timeLeft)}</span>
            </div>
          </div>

          {!callStarted &&
            selectedAppt.appointment.status === "CREATED" &&
            timeLeft > 0 &&
            timeLeft <= CALL_BUFFER_SECONDS && (
              <button
                className="primary-btn"
                style={{ marginTop: "20px" }}
                onClick={async () => {
                  let roomId = selectedAppt.appointment.roomId;
                  if (!roomId) {
                    roomId = "ROOM_" + crypto.randomUUID();
await AppointmentAPI.updateAppointment(
  selectedAppt.appointment.appointmentId,
  { roomId }
);

// update local state
setAppointments(prev => {
  const updated = prev.map(a =>
    a.appointment.appointmentId === selectedAppt.appointment.appointmentId
      ? {
          ...a,
          appointment: { ...a.appointment, roomId },
        }
      : a
  );

  localStorage.setItem(
    CACHE_DOCTOR_APPOINTMENTS,
    JSON.stringify(updated)
  );

  return updated;
});

setSelectedAppt(prev => ({
  ...prev,
  appointment: { ...prev.appointment, roomId },
}));

                  }
                  setCallStarted(true);
                }}
              >
                Join Video Consultation
              </button>
            )}

          {callStarted && (
            <div className="jitsi-wrapper animate-fade-in" style={{ marginTop: "20px" }}>
              <button
                className="logout-btn"
                style={{ marginBottom: "15px", width: "100%" }}
                onClick={async () => {
                  setCallStarted(false);
                  await new Promise((r) => setTimeout(r, 300));
await AppointmentAPI.completeAppointment(
  selectedAppt.appointment.appointmentId
);

setAppointments(prev => {
  const updated = prev.map(a =>
    a.appointment.appointmentId === selectedAppt.appointment.appointmentId
      ? {
          ...a,
          appointment: {
            ...a.appointment,
            status: "COMPLETED",
          },
        }
      : a
  );

  localStorage.setItem(
    CACHE_DOCTOR_APPOINTMENTS,
    JSON.stringify(updated)
  );

  return updated;
});

setSelectedAppt(null);

                }}
              >
                End Call & Mark as Completed
              </button>
              
              <div className="video-container" style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>
                <JitsiMeeting
                  roomId={selectedAppt.appointment.roomId}
                  displayName={`Dr. ${doctor.name}`}
                  email={doctor.email}
                  role="DOCTOR"
                  onClose={() => setCallStarted(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
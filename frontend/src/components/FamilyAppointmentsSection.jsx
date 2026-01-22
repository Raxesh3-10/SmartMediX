import { useEffect, useState } from "react";
import JitsiMeeting from "./JitsiMeeting";
import "../styles/Doctor.css"; // We will use the same classses here

const formatDate = (dateValue) => {
  const d = new Date(dateValue);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

export default function FamilyAppointmentsSection({
  familyAppointments = [],
  currentPatient,
}) {
  const [selected, setSelected] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!selected) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const appt = selected.appointment;
      if (!appt?.startTime) {
        setTimeLeft(0);
        return;
      }

      const baseDate = appt.appointmentDate ? new Date(appt.appointmentDate) : new Date();
      const [h, m] = appt.startTime.split(":").map(Number);

      const startIST = new Date(baseDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      startIST.setHours(h, m, 0, 0);

      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const diffSeconds = Math.floor((startIST.getTime() - nowIST.getTime()) / 1000);

      setTimeLeft(Math.max(0, diffSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [selected]);

  /* ================= GROUP BY FAMILY MEMBER ================= */
  const grouped = familyAppointments.reduce((acc, a) => {
    const key = a.familyMemberPatientId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: "20px" }} className="animate-fade-in">
      <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Family Appointments</h3>

      {Object.keys(grouped).length === 0 && (
        <div className="profile-box" style={{ textAlign: "center", color: "#64748b" }}>
          No family appointments found.
        </div>
      )}

      {Object.entries(grouped).map(([familyId, list]) => {
        const info = list[0].familyPatientUser;

        return (
          <div key={familyId} className="profile-box" style={{ marginBottom: "20px", padding: "0" }}>
            {/* FAMILY HEADER */}
            <div style={{ padding: "15px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <strong style={{ fontSize: "1.1rem" }}>{info?.name}</strong>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{info?.email}</div>
              <span className="status-badge created" style={{ marginTop: "8px", display: "inline-block" }}>
                Relation: {list[0].relation}
              </span>
            </div>

            {/* APPOINTMENTS FOR THIS MEMBER */}
            <div style={{ padding: "10px" }}>
              {list.map((a) => {
                const isSelected = selected?.appointment.appointmentId === a.appointment.appointmentId;
                return (
                  <div
                    key={a.appointment.appointmentId}
                    className={`record-card ${isSelected ? "active" : ""}`}
                    style={{ marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => {
                      setSelected(a);
                      setCallStarted(false);
                    }}
                  >
                    <div className="record-details">
                      <strong>Consultation with Dr. {a.user?.name}</strong>
                      <div className="record-meta">
                        📅 {formatDate(a.appointment.appointmentDate)} | {a.appointment.startTime} – {a.appointment.endTime}
                      </div>
                    </div>
                    <div className="status-badge-container">
                      <span className={`status-badge ${a.appointment.status.toLowerCase()}`}>
                        {a.appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* CALL JOINING SECTION */}
      {selected && selected.appointment.roomId && selected.appointment.status === "CREATED" && (
        <div className="profile-box animate-fade-in" style={{ borderTop: "4px solid #2563eb", marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h4 style={{ margin: 0 }}>Join Consultation for {selected.familyPatientUser?.name}</h4>
            <div className="timer-box">
              Starts in: <span className="timer-countdown">{formatCountdown(timeLeft)}</span>
            </div>
          </div>

          <div style={{ marginTop: "15px", background: "#f1f5f9", padding: "12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <code>Room ID: {selected.appointment.roomId}</code>
              <button
                className="primary-btn"
                style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                onClick={() => navigator.clipboard.writeText(selected.appointment.roomId)}
              >
                Copy ID
              </button>
            </div>
          </div>

          {!callStarted ? (
            <button
              className="primary-btn"
              style={{ marginTop: "20px", width: "100%" }}
              onClick={() => setCallStarted(true)}
            >
              Join Video Call
            </button>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <button
                className="logout-btn"
                style={{ marginBottom: "15px", width: "100%" }}
                onClick={() => setCallStarted(false)}
              >
                Leave Consultation
              </button>
              <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>
                <JitsiMeeting
                  roomId={selected.appointment.roomId}
                  displayName={currentPatient.name}
                  email={currentPatient.email}
                  role="PATIENT"
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
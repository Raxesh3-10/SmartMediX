/* ================= FAMILY APPOINTMENTS ONLY ================= */
import { useEffect, useState } from "react";
import JitsiMeeting from "./JitsiMeeting";

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

  return `${String(days).padStart(2, "0")} : ${String(hours).padStart(
    2,
    "0"
  )} : ${String(minutes).padStart(2, "0")}`;
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

      const baseDate = appt.appointmentDate
        ? new Date(appt.appointmentDate)
        : new Date();

      const [h, m] = appt.startTime.split(":").map(Number);

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
  }, [selected]);

  /* ================= GROUP BY FAMILY MEMBER ================= */
  const grouped = familyAppointments.reduce((acc, a) => {
    const key = a.familyMemberPatientId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Family Appointments</h3>

      {Object.keys(grouped).length === 0 && (
        <div>No family appointments found.</div>
      )}

      {Object.entries(grouped).map(([familyId, list]) => {
        const info = list[0].familyPatientUser;

        return (
          <div key={familyId} style={styles.familyBlock}>
            <div style={styles.familyHeader}>
              <strong>{info?.name}</strong>
              <div style={styles.sub}>{info?.email}</div>
              <div style={styles.relation}>
                Relation: {list[0].relation}
              </div>
            </div>

            {list.map((a) => (
              <div
                key={a.appointment.appointmentId}
                style={{
                  ...styles.card,
                  background:
                    selected?.appointment.appointmentId ===
                    a.appointment.appointmentId
                      ? "#dcfce7"
                      : "#ffffff",
                }}
                onClick={() => {
                  setSelected(a);
                  setCallStarted(false);
                }}
              >
                <div>
                  <strong>{a.user?.name}</strong>
                  <div style={styles.sub}>{a.user?.email}</div>
                  <div style={styles.meta}>
                    {formatDate(a.appointment.appointmentDate)} |{" "}
                    {a.appointment.day} | {a.appointment.startTime} –{" "}
                    {a.appointment.endTime}
                  </div>
                </div>
                <div>{a.appointment.status}</div>
              </div>
            ))}
          </div>
        );
      })}

      {selected &&
        selected.appointment.roomId &&
        selected.appointment.status === "CREATED" && (
          <div style={styles.details}>
            <p>
              Time Left: <strong>{formatCountdown(timeLeft)}</strong>
            </p>

            <div style={{ marginBottom: 10 }}>
              <strong>Room ID:</strong>
              <div style={styles.roomBox}>
                <span>{selected.appointment.roomId}</span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      selected.appointment.roomId
                    )
                  }
                >
                  Copy
                </button>
              </div>
            </div>

            {!callStarted ? (
              <button
                style={styles.primaryBtn}
                onClick={() => setCallStarted(true)}
              >
                Join Call
              </button>
            ) : (
              <button
                style={styles.dangerBtn}
                onClick={() => setCallStarted(false)}
              >
                Leave Call
              </button>
            )}

            {callStarted && (
              <JitsiMeeting
                roomId={selected.appointment.roomId}
                displayName={currentPatient.name}
                email={currentPatient.email}
                role="PATIENT"
                onClose={() => setCallStarted(false)}
              />
            )}
          </div>
        )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  familyBlock: {
    border: "1px solid #e5e7eb",
    marginTop: 15,
    padding: 10,
  },
  familyHeader: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: "1px dashed #cbd5e1",
  },
  relation: {
    fontSize: 12,
    color: "#475569",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  sub: { fontSize: 12, color: "#64748b" },
  meta: { fontSize: 13 },
  details: {
    marginTop: 20,
    padding: 15,
    border: "1px solid #e5e7eb",
  },
  roomBox: {
    background: "#f1f5f9",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryBtn: {
    marginTop: 10,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
  },
  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
  },
};
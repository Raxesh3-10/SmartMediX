import { useEffect, useState, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI } from "../../api/api";
import { createRoomConnection } from "../../utils/useWebRTC";

export default function DoctorAppointmentsPage() {
  const { doctor } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
const [callStarted, setCallStarted] = useState(false);
const [conn, setConn] = useState(null);
const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadAppointments();
  }, [doctor]);
useEffect(() => {
  return () => {
    conn?.leave();
  };
}, []);

  const loadAppointments = async () => {
    const res = await AppointmentAPI.getDoctorAppointments(
      doctor.doctorId
    );
    setAppointments(res.data);
  };

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    return appointments.filter((a) =>
      `${a.user.name} ${a.user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  /* ================= IST HELPERS ================= */
  const toISTMillis = (date) =>
    new Date(date).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

  const formatDiff = (totalSeconds) => {
    if (totalSeconds <= 0) return "00 : 00 : 00";

    const totalMinutes = Math.floor(totalSeconds / 60);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor(
      (totalMinutes % (24 * 60)) / 60
    );
    const minutes = totalMinutes % 60;

    return `${String(days).padStart(2, "0")} : ${String(
      hours
    ).padStart(2, "0")} : ${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  /* ================= COUNTDOWN ================= */
useEffect(() => {
  if (!selectedAppt) return;

  const interval = setInterval(() => {
    const date =
      selectedAppt.appointment.appointmentDate.split("T")[0];

    const start = new Date(
      `${date}T${selectedAppt.appointment.startTime}`
    ).getTime();

    const diffSeconds = Math.floor(
      (start - Date.now()) / 1000
    );

    setTimeLeft(diffSeconds);
  }, 1000);

  return () => clearInterval(interval);
}, [selectedAppt]);

  /* ================= START CALL ================= */
const startCall = async () => {
  const roomId = `appointment-${selectedAppt.appointment.appointmentId}`;

  const connection = await createRoomConnection({
    roomId,
    localVideoRef,
    role: "DOCTOR",
    onRemoteStream: (id, stream) => {
      setRemoteStreams((s) => ({ ...s, [id]: stream }));
    },
  });

  setConn(connection);
  setCallStarted(true);
};

  /* ================= END CALL ================= */
const endCallAndComplete = async () => {
  conn?.leave();
  setRemoteStreams({});
  setCallStarted(false);

  await AppointmentAPI.completeAppointment(
    selectedAppt.appointment.appointmentId
  );

  setSelectedAppt(null);
  loadAppointments();
};


  return (
    <div style={styles.page}>
      <h3>Doctor Appointments</h3>

      <input
        placeholder="Search patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {filtered.map((a) => {
        const isSelected =
          selectedAppt?.appointment.appointmentId ===
          a.appointment.appointmentId;

        return (
          <div
            key={a.appointment.appointmentId}
            style={{
              ...styles.card,
              background: isSelected
                ? "#dcfce7"
                : "transparent",
            }}
            onClick={() => {
              setSelectedAppt(a);
              setCallStarted(false);
            }}
          >
            <div>
              <strong>{a.user.name}</strong>
              <div style={styles.sub}>
                {a.user.email}
              </div>
              <div style={styles.meta}>
                {a.appointment.day} |{" "}
                {new Date(
                  a.appointment.startTime
                ).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                –{" "}
                {new Date(
                  a.appointment.endTime
                ).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </div>
            </div>

            <div>{a.appointment.status}</div>
          </div>
        );
      })}

      {selectedAppt && (
        <div style={styles.details}>
          <h4>Selected Appointment</h4>

          <p>
            Patient:{" "}
            <strong>{selectedAppt.user.name}</strong>
          </p>

          <p>
            Time Left:{" "}
            <strong>{formatDiff(timeLeft)}</strong>
          </p>

          {!callStarted &&
            timeLeft !== null &&
            timeLeft <= 600 &&
            timeLeft > 0 && (
              <button
                style={styles.primaryBtn}
                onClick={startCall}
              >
                Start Call
              </button>
            )}

          {callStarted && (
            <button
              style={styles.dangerBtn}
              onClick={endCallAndComplete}
            >
              End Call & Complete
            </button>
          )}

{callStarted && (
  <div style={styles.videoBox}>
    <video
      ref={localVideoRef}
      autoPlay
      muted
      style={styles.video}
    />
    {Object.entries(remoteStreams).map(([id, stream]) => (
      <video
        key={id}
        autoPlay
        style={styles.video}
        ref={el => el && (el.srcObject = stream)}
      />
    ))}
  </div>
)}

        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { padding: 20 },
  search: { marginBottom: 15, padding: 6, width: "100%" },
  card: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
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
  primaryBtn: {
    marginRight: 10,
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
  videoBox: { marginTop: 20, display: "flex", gap: 10 },
  video: { width: "45%", border: "1px solid #e5e7eb" },
};

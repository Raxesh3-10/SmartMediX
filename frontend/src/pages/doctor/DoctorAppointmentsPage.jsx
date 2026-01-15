import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI } from "../../api/api";

const CALL_BUFFER_MINUTES = 10;
const MS = 60 * 1000;

export default function DoctorAppointmentsPage() {
  const { doctor } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    AppointmentAPI.getDoctorAppointments(doctor.doctorId)
      .then(r => setAppointments(r.data));
  }, [doctor]);

  const filtered = useMemo(() => {
    return appointments.filter(a =>
      `${a.user?.name} ${a.user?.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  useEffect(() => {
    if (!selectedAppt) return;

    const i = setInterval(() => {
      const start = new Date(selectedAppt.appointment.startTime).getTime();
      setTimeLeft(Math.floor((start - Date.now()) / 1000));
    }, 1000);

    return () => clearInterval(i);
  }, [selectedAppt]);

  const formatDiff = (s) => {
    if (s <= 0) return "Ready";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const canStartCall = () => {
    const start = new Date(selectedAppt.appointment.startTime).getTime();
    const diff = Math.abs(Date.now() - start);
    return diff <= CALL_BUFFER_MINUTES * MS;
  };

  const startCall = async () => {
    if (!canStartCall()) return alert("Call available 10 minutes before/after start");

    await AppointmentAPI.assignRoomId(
      selectedAppt.appointment.appointmentId
    );

    setCallStarted(true);
  };

  const endCall = async () => {
    await AppointmentAPI.completeAppointment(
      selectedAppt.appointment.appointmentId
    );
    setCallStarted(false);
    setSelectedAppt(null);

    const r = await AppointmentAPI.getDoctorAppointments(doctor.doctorId);
    setAppointments(r.data);
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

      {filtered.map(a => (
        <div
          key={a.appointment.appointmentId}
          style={{
            ...styles.card,
            background:
              selectedAppt?.appointment.appointmentId ===
              a.appointment.appointmentId
                ? "#dcfce7"
                : "transparent",
          }}
          onClick={() => !callStarted && setSelectedAppt(a)}
        >
          <div>
            <strong>{a.user?.name}</strong>
            <div style={styles.sub}>{a.user?.email}</div>
            <div style={styles.meta}>
              {new Date(a.appointment.startTime).toLocaleTimeString()}
            </div>
          </div>
          <div>{a.appointment.status}</div>
        </div>
      ))}
<JitsiMeeting
  roomId={roomId}
  displayName={`Dr. ${doctor.name}`}
  email={doctor.email}
  role="DOCTOR"
  onClose={endCall}
/>

      {selectedAppt && (
        <div style={styles.details}>
          <p>Time to start: <strong>{formatDiff(timeLeft)}</strong></p>

          {!callStarted ? (
            <button
              style={styles.primaryBtn}
              onClick={startCall}
              disabled={!canStartCall()}
            >
              Start Call
            </button>
          ) : (
            <button style={styles.dangerBtn} onClick={endCall}>
              End Call & Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20 },
  search: { marginBottom: 15, padding: 8, width: "100%", boxSizing: "border-box" },
  card: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
  },
  sub: { fontSize: 12, color: "#64748b" },
  meta: { fontSize: 13 },
  details: {
    marginTop: 20,
    padding: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#f8fafc"
  },
  controls: { marginBottom: 20 },
  primaryBtn: {
    marginRight: 10,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer"
  },
  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer"
  },
  videoBox: { 
    marginTop: 20, 
    display: "flex", 
    gap: 15,
    flexWrap: "wrap"
  },
  videoWrapper: {
    position: 'relative',
    width: "45%",
    minWidth: "300px"
  },
  video: { 
    width: "100%", 
    background: "#000", 
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  label: {
    position: 'absolute',
    top: 5,
    left: 5,
    background: "rgba(0,0,0,0.5)",
    color: "white",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: "12px"
  }
}
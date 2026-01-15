import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI, PaymentAPI } from "../../api/api";

const DAYS = [
  "SUNDAY","MONDAY","TUESDAY","WEDNESDAY",
  "THURSDAY","FRIDAY","SATURDAY"
];

const CALL_BUFFER_MINUTES = 10;
const MS = 60 * 1000;

export default function PatientAppointmentsPage() {
  const { patient } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);

  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  const [callStarted, setCallStarted] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    AppointmentAPI.getPatientAppointments(patient.patientId)
      .then(r => setAppointments(r.data));

    AppointmentAPI.getPatientDoctors(patient.patientId)
      .then(r => setDoctors(r.data));
  }, [patient]);

  /* ================= SEARCH ================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a =>
      `${a.user?.name ?? ""} ${a.user?.email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  /* ================= COUNTDOWN (SAME AS DOCTOR) ================= */
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

  /* ================= SLOT LOGIC ================= */
  const next7DaysSlots = useMemo(() => {
    if (!selectedDoctor) return [];

    const now = new Date();
    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);

      const day = DAYS[d.getDay()];
      const slots =
        selectedDoctor.slots?.filter(s => s.day === day) || [];

      if (slots.length) {
        result.push({ date: d, day, slots });
      }
    }
    return result;
  }, [selectedDoctor]);

  const updateSlot = async () => {
    if (!selectedSlotKey) return;

    await AppointmentAPI.updateAppointmentSlot(
      selectedAppt.appointment.appointmentId,
      selectedSlotKey
    );

    const r = await AppointmentAPI.getPatientAppointments(patient.patientId);
    setAppointments(r.data);
    setSelectedSlotKey(null);
    alert("Slot updated");
  };

  /* ================= CALL ================= */
  const canStartCall = () => {
    const start = new Date(selectedAppt.appointment.startTime).getTime();
    const diff = Math.abs(Date.now() - start);
    return diff <= CALL_BUFFER_MINUTES * MS;
  };

  const joinCall = async () => {
    if (!canStartCall()) return alert("Call available 10 minutes before/after start");

    await AppointmentAPI.assignRoomId(
      selectedAppt.appointment.appointmentId
    );

    setCallStarted(true);
  };

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <h3>My Appointments</h3>

      <input
        placeholder="Search doctor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {filteredAppointments.map(a => (
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
          onClick={() => {
            setSelectedAppt(a);
            setSelectedDoctor(
              doctors.find(d => d.doctor.doctorId === a.appointment.doctorId)
            );
            setCallStarted(false);
          }}
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
  displayName={patient.name}
  email={patient.email}
  role="PATIENT"
  onClose={() => setCallStarted(false)}
/>

      {selectedAppt && (
        <div style={styles.details}>
          <p>Time to start: <strong>{formatDiff(timeLeft)}</strong></p>

          {!callStarted && (
            <button
              style={styles.primaryBtn}
              onClick={joinCall}
              disabled={!canStartCall()}
            >
              Join Call
            </button>
          )}

          {/* SLOT UPDATE */}
          <h4 style={{ marginTop: 20 }}>Change Slot (Next 7 Days)</h4>

          {next7DaysSlots.map(d => (
            <div key={d.day}>
              <strong>{d.day}</strong>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {d.slots.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSlotKey(s.key)}
                    style={{
                      padding: "6px 10px",
                      border:
                        selectedSlotKey === s.key
                          ? "2px solid #2563eb"
                          : "1px solid #ccc",
                    }}
                  >
                    {s.start} - {s.end}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {selectedSlotKey && (
            <button
              style={{ ...styles.primaryBtn, marginTop: 10 }}
              onClick={updateSlot}
            >
              Update Slot
            </button>
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
  videoBox: { marginTop: 20, display: "flex", gap: 10 },
  video: { width: "45%", border: "1px solid #e5e7eb" },
};
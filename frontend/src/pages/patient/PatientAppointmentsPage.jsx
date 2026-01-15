import { useEffect, useState, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI, PaymentAPI } from "../../api/api";
import { createRoomConnection } from "../../utils/useWebRTC";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function PatientAppointmentsPage() {
  const { patient } = useOutletContext();

  /* ================= STATE ================= */
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);

  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState("--:--:--");

  const [callStarted, setCallStarted] = useState(false);
  const [callStatus, setCallStatus] = useState(null); // 👈 loading state
  const [conn, setConn] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});

  const localVideoRef = useRef(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [patient]);

  useEffect(() => {
    return () => {
      conn?.leave();
    };
  }, [conn]);

  const loadAppointments = async () => {
    const res = await AppointmentAPI.getPatientAppointments(
      patient.patientId
    );
    setAppointments(res.data);
  };

  const loadDoctors = async () => {
    const res = await AppointmentAPI.getPatientDoctors(
      patient.patientId
    );
    setDoctors(res.data);
  };

  /* ================= SEARCH ================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) =>
      `${a.user?.name ?? ""} ${a.user?.email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  /* ================= TIME LEFT (UTC SAFE) ================= */
  useEffect(() => {
    if (!selectedAppt) {
      setTimeLeft("--:--:--");
      return;
    }

    const interval = setInterval(() => {
      const startMillis = new Date(
        selectedAppt.appointment.startTime
      ).getTime();

      const diffSeconds = Math.max(
        0,
        Math.floor((startMillis - Date.now()) / 1000)
      );

      const days = Math.floor(diffSeconds / 86400);
      const hours = Math.floor((diffSeconds % 86400) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);

      setTimeLeft(
        `${String(days).padStart(2, "0")}:${String(hours).padStart(
          2,
          "0"
        )}:${String(minutes).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAppt]);

  /* ================= CALL ================= */
  const joinCall = async () => {
    const roomId = selectedAppt.appointment.roomId; // ✅ FROM DB

    const connection = await createRoomConnection({
      roomId,
      localVideoRef,
      role: "PATIENT",
      onRemoteStream: (id, stream) => {
        setRemoteStreams((s) => ({ ...s, [id]: stream }));
      },
      onStatus: setCallStatus, // 👈 loading feedback
    });

    setConn(connection);
    setCallStarted(true);
  };

  const leaveCall = () => {
    conn?.leave();
    setRemoteStreams({});
    setCallStarted(false);
    setCallStatus(null);
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

      {/* 🔴 ALWAYS MOUNT LOCAL VIDEO */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }}
      />

      {/* ================= APPOINTMENT LIST ================= */}
      {filteredAppointments.map((a) => (
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
              doctors.find(
                (d) => d.doctor.doctorId === a.appointment.doctorId
              )
            );
            setSelectedSlotKey(null);
            setCallStarted(false);
            setCallStatus(null);
          }}
        >
          <div>
            <strong>{a.user?.name}</strong>
            <div style={styles.sub}>{a.user?.email}</div>
            <div style={styles.meta}>
              {new Date(a.appointment.startTime).toLocaleTimeString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
              )}{" "}
              –{" "}
              {new Date(a.appointment.endTime).toLocaleTimeString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
              )}
            </div>
          </div>
          <div>{a.appointment.status}</div>
        </div>
      ))}

      {/* ================= DETAILS ================= */}
      {selectedAppt && (
        <div style={styles.details}>
          <p>
            Time Left: <strong>{timeLeft}</strong>
          </p>

          {callStatus && (
            <p>
              <strong>Call status:</strong> {callStatus}
            </p>
          )}

          {!callStarted ? (
            <button
              style={styles.primaryBtn}
              onClick={joinCall}
              disabled={callStatus !== null}
            >
              {callStatus ? "Joining..." : "Join Call"}
            </button>
          ) : (
            <button
              style={styles.dangerBtn}
              onClick={leaveCall}
            >
              Leave Call
            </button>
          )}

          {callStarted && (
            <div style={styles.videoBox}>
              {Object.entries(remoteStreams).map(
                ([id, stream]) => (
                  <video
                    key={id}
                    autoPlay
                    playsInline
                    style={styles.video}
                    ref={(el) =>
                      el && (el.srcObject = stream)
                    }
                  />
                )
              )}
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
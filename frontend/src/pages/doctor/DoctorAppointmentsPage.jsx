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
  
  // Call State
  const [callStarted, setCallStarted] = useState(false);
  const [conn, setConn] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callStatus, setCallStatus] = useState(null);
  
  const localVideoRef = useRef(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadAppointments();
  }, [doctor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conn?.leave();
    };
  }, [conn]);

  const loadAppointments = async () => {
    try {
      const res = await AppointmentAPI.getDoctorAppointments(doctor.doctorId);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error loading appointments", err);
    }
  };

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    return appointments.filter((a) =>
      `${a.user?.name} ${a.user?.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  const formatDiff = (totalSeconds) => {
    if (totalSeconds <= 0) return "Ready";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!selectedAppt) return;
    const interval = setInterval(() => {
      const start = new Date(selectedAppt.appointment.startTime).getTime();
      const diffSeconds = Math.floor((start - Date.now()) / 1000);
      setTimeLeft(diffSeconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAppt]);

  /* ================= START CALL ================= */
  const startCall = async () => {
    // 1. Update UI state first
    setCallStarted(true); 

    // 2. Use the actual DB room ID, or fallback to generated one if logic dictates
    const roomId = selectedAppt.appointment.roomId || `appointment-${selectedAppt.appointment.appointmentId}`;

    try {
      const connection = await createRoomConnection({
        roomId,
        localVideoRef, // Ref is now guaranteed to exist because we un-hid the video
        role: "DOCTOR",
        onRemoteStream: (id, stream) => {
          setRemoteStreams((prev) => ({ ...prev, [id]: stream }));
        },
        onStatus: setCallStatus,
      });
      setConn(connection);
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStarted(false);
      alert("Could not access camera/microphone.");
    }
  };

  /* ================= END CALL ================= */
  const endCallAndComplete = async () => {
    conn?.leave();
    setRemoteStreams({});
    setCallStarted(false);
    setConn(null);

    try {
      await AppointmentAPI.completeAppointment(
        selectedAppt.appointment.appointmentId
      );
      setSelectedAppt(null);
      loadAppointments();
    } catch (err) {
      console.error("Error completing appointment", err);
    }
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

      {/* LIST */}
      {filtered.map((a) => {
        const isSelected = selectedAppt?.appointment.appointmentId === a.appointment.appointmentId;
        return (
          <div
            key={a.appointment.appointmentId}
            style={{
              ...styles.card,
              background: isSelected ? "#dcfce7" : "transparent",
            }}
            onClick={() => {
              if (callStarted) return; // Prevent changing while in call
              setSelectedAppt(a);
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
        );
      })}

      {/* DETAILS PANEL */}
      {selectedAppt && (
        <div style={styles.details}>
          <h4>Active Session: {selectedAppt.user.name}</h4>
          <p>Time to start: <strong>{formatDiff(timeLeft)}</strong></p>
          <p>Status: {callStatus || "Idle"}</p>

          <div style={styles.controls}>
            {!callStarted ? (
              <button style={styles.primaryBtn} onClick={startCall}>
                Start Video Call
              </button>
            ) : (
              <button style={styles.dangerBtn} onClick={endCallAndComplete}>
                End Call & Mark Complete
              </button>
            )}
          </div>

          {/* VIDEO CONTAINER */}
          {/* CRITICAL FIX: We use 'display' to toggle visibility, but the element is ALWAYS mounted.
              This ensures localVideoRef.current is never null. */}
          <div style={{ ...styles.videoBox, display: callStarted ? 'flex' : 'none' }}>
            
            {/* Local Video */}
            <div style={styles.videoWrapper}>
                <span style={styles.label}>You</span>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={styles.video}
                />
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([id, stream]) => (
               <div key={id} style={styles.videoWrapper}>
                  <span style={styles.label}>Patient</span>
                  <video
                    autoPlay
                    playsInline
                    style={styles.video}
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                  />
              </div>
            ))}
          </div>
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
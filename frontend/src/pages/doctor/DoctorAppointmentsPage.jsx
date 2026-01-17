import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI } from "../../api/api";
import JitsiMeeting from "../../components/JitsiMeeting";

/* ================= CONSTANTS ================= */
const CALL_BUFFER_SECONDS = 10 * 60;

/* ================= HELPERS ================= */
const normalizeId = (id) =>
  typeof id === "string" ? id : id?.$oid ?? "";

const generateRoomId = () =>
  "ROOM_" + crypto.randomUUID();

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

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!doctor) return;
    loadAppointments();
  }, [doctor]);

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

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <h3>Doctor Appointments</h3>

      <input
        placeholder="Search patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {filtered.map((a) => (
        <div
          key={normalizeId(a.appointment._id)}
          style={{
            ...styles.card,
            background:
              normalizeId(selectedAppt?.appointment?._id) ===
              normalizeId(a.appointment._id)
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
            <div style={styles.sub}>{a.user.email}</div>
            <div style={styles.meta}>
              {a.appointment.day} | {a.appointment.startTime} –{" "}
              {a.appointment.endTime}
            </div>
          </div>
          <div>{a.appointment.status}</div>
        </div>
      ))}

      {selectedAppt && (
        <div style={styles.details}>
          <p>
            Time Left:{" "}
            <strong>{formatCountdown(timeLeft)}</strong>
          </p>

          {!callStarted &&
            selectedAppt.appointment.status === "CREATED" &&
            timeLeft > 0 &&
            timeLeft <= CALL_BUFFER_SECONDS && (
              <button
                style={styles.primaryBtn}
                onClick={async () => {
                  // 🔑 CREATE ROOM ID IF MISSING
                  if (!selectedAppt.appointment.roomId) {
                    const roomId = generateRoomId();
                    await AppointmentAPI.updateAppointment(
                      normalizeId(selectedAppt.appointment.appointmentId),
                      { roomId }
                    );
                    await loadAppointments();
                  }
                  setCallStarted(true);
                }}
              >
                Start Call
              </button>
            )}

          {callStarted && (
            <button
              style={styles.dangerBtn}
              onClick={async () => {
                // Close Jitsi first
                setCallStarted(false);

                // Allow iframe cleanup
                await new Promise((r) => setTimeout(r, 300));

                await AppointmentAPI.completeAppointment(
                  normalizeId(
                    selectedAppt.appointment.appointmentId
                  )
                );
                setSelectedAppt(null);
                loadAppointments();
              }}
            >
              End Call & Complete
            </button>
          )}

          {callStarted && (
            <JitsiMeeting
              roomId={selectedAppt.appointment.roomId}
              displayName={`Dr. ${doctor.name}`}
              email={doctor.email}
              role="DOCTOR"
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
};
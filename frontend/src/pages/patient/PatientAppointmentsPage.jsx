import { useEffect, useState, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI, PaymentAPI } from "../../api/api";
import { createPeerConnection } from "../../utils/useWebRTC";

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
  const [pc, setPc] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [patient]);

  const loadAppointments = async () => {
    const res = await AppointmentAPI.getPatientAppointments(patient.patientId);
    setAppointments(res.data);
  };

  const loadDoctors = async () => {
    const res = await AppointmentAPI.getPatientDoctors(patient.patientId);
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

  /* ================= SLOT HELPERS ================= */
  const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

  /* ================= TIME LEFT ================= */
  useEffect(() => {
    if (!selectedAppt) {
      setTimeLeft("--:--:--");
      return;
    }

    const interval = setInterval(() => {
      const date = selectedAppt.appointment.appointmentDate.split("T")[0];
      const startISO = `${date}T${selectedAppt.appointment.startTime}`;

      const startMillis = new Date(startISO).getTime();
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

  /* ================= BOOK / UPDATE ================= */
  const saveAppointment = async (isUpdate) => {
    if (!selectedDoctor || !selectedSlotKey) {
      alert("Select a slot first");
      return;
    }

    const slot = selectedDoctor.slots.find(
      (s) => slotKey(s) === selectedSlotKey
    );

    if (!slot) return;

    if (!isUpdate) {
      // BOOK
      const res = await AppointmentAPI.createAppointment({
        patientId: patient.patientId,
        doctorId: selectedDoctor.doctor.doctorId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        appointmentDate: new Date().toISOString(),
        conferenceType: "VIDEO",
      });

      await PaymentAPI.payForAppointment(res.data.appointmentId);
      alert("Appointment booked");
    } else {
      // UPDATE
      await AppointmentAPI.updateAppointment(
        selectedAppt.appointment.appointmentId,
        {
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }
      );
      alert("Appointment updated");
    }

    setSelectedSlotKey(null);
    loadAppointments();
    loadDoctors();
  };

  /* ================= CALL ================= */
  const joinCall = async () => {
    const roomId = `appointment-${selectedAppt.appointment.appointmentId}`;

    const peer = await createPeerConnection({
      roomId,
      localVideoRef,
      remoteVideoRef,
      isCaller: false,
    });

    setPc(peer);
    setCallStarted(true);
  };

  const leaveCall = () => {
    pc?.getSenders().forEach((s) => s.track?.stop());
    pc?.close();
    setCallStarted(false);
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
          }}
        >
          <div>
            <strong>{a.user?.name}</strong>
            <div style={styles.sub}>{a.user?.email}</div>
            <div style={styles.meta}>
              {a.appointment.day} | {a.appointment.startTime} –{" "}
              {a.appointment.endTime}
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

          {!callStarted ? (
            <button style={styles.primaryBtn} onClick={joinCall}>
              Join Call
            </button>
          ) : (
            <button style={styles.dangerBtn} onClick={leaveCall}>
              Leave Call
            </button>
          )}

          {callStarted && (
            <div style={styles.videoBox}>
              <video ref={localVideoRef} autoPlay muted style={styles.video} />
              <video ref={remoteVideoRef} autoPlay style={styles.video} />
            </div>
          )}
        </div>
      )}

      {/* ================= UPDATE SECTION ================= */}
      {selectedAppt && selectedDoctor && (
        <div style={styles.details}>
          <h4>Update Appointment Slot</h4>
          {renderSlotGrid(selectedDoctor, selectedSlotKey, setSelectedSlotKey)}
          <button
            style={styles.primaryBtn}
            onClick={() => saveAppointment(true)}
          >
            Update Slot
          </button>
        </div>
      )}

      {/* ================= BOOK SECTION ================= */}
      <div style={styles.details}>
        <h4>Book New Appointment</h4>

        {doctors.map((d) => (
          <div
            key={d.doctor.doctorId}
            style={{
              ...styles.card,
              background:
                selectedDoctor?.doctor.doctorId === d.doctor.doctorId
                  ? "#dcfce7"
                  : "transparent",
            }}
            onClick={() => {
              setSelectedDoctor(d);
              setSelectedSlotKey(null);
            }}
          >
            <strong>{d.user?.name}</strong>
            <div style={styles.sub}>{d.user?.email}</div>
          </div>
        ))}

        {selectedDoctor &&
          renderSlotGrid(
            selectedDoctor,
            selectedSlotKey,
            setSelectedSlotKey
          )}

        <button
          style={styles.primaryBtn}
          onClick={() => saveAppointment(false)}
        >
          Book Slot
        </button>
      </div>
    </div>
  );
}

/* ================= SLOT GRID RENDER ================= */
function renderSlotGrid(doctor, selectedSlotKey, setSelectedSlotKey) {
  const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

  return (
    <div style={styles.grid}>
      {DAYS.map((day) => (
        <div key={day} style={styles.dayColumn}>
          <strong>{day}</strong>

          {(doctor.slots || [])
            .filter((s) => s.day === day)
            .map((s) => {
              const key = slotKey(s);
              const selected = selectedSlotKey === key;

              return (
                <div
                  key={key}
                  onClick={() => !s.booked && setSelectedSlotKey(key)}
                  style={{
                    ...styles.slot,
                    background: s.booked
                      ? "#dc2626"
                      : selected
                      ? "#16a34a"
                      : "#ffffff",
                    color:
                      s.booked || selected ? "#ffffff" : "#0f172a",
                  }}
                >
                  {s.startTime} – {s.endTime}
                </div>
              );
            })}
        </div>
      ))}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 16,
    marginTop: 10,
  },
  dayColumn: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  slot: {
    border: "2px solid #cbd5e1",
    padding: 8,
    marginTop: 6,
    textAlign: "center",
    borderRadius: 8,
  },
};
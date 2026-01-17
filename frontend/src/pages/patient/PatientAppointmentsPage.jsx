import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppointmentAPI, PaymentAPI } from "../../api/api";
import JitsiMeeting from "../../components/JitsiMeeting";

/* ================= CONSTANTS ================= */
const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const normalizeId = (id) =>
  typeof id === "string" ? id : id?.$oid ?? "";

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

const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

/* ================= COMPONENT ================= */
export default function PatientAppointmentsPage() {
  const { patient } = useOutletContext();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState(null);

  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [callStarted, setCallStarted] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!patient) return;
    loadAppointments();
    loadDoctors();
  }, [patient]);

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

  /* ================= CALL STATUS WATCH ================= */
useEffect(() => {
  if (!callStarted || !selectedAppt) return;

  const interval = setInterval(() => {
    const latest = appointments.find(
      (a) =>
        normalizeId(a.appointment.appointmentId) ===
        normalizeId(selectedAppt.appointment.appointmentId)
    );

    if (latest?.appointment.status === "COMPLETED") {
      alert("Consultation ended by doctor");
      setCallStarted(false);
    }
  }, 4000);

  return () => clearInterval(interval);
}, [callStarted, selectedAppt, appointments]);

  /* ================= SAVE ================= */
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
      const res = await AppointmentAPI.createAppointment({
        patientId: patient.patientId,
        doctorId: selectedDoctor.doctor.doctorId,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        appointmentDate: new Date().toISOString(),
        conferenceType: "VIDEO",
      });

      await PaymentAPI.payForAppointment(res.data._id);
      alert("Appointment booked");
    } else {
      await AppointmentAPI.updateAppointment(
        selectedAppt.appointment.appointmentId,
        slot
      );
      alert("Appointment updated");
    }

    setSelectedSlotKey(null);
    loadAppointments();
    loadDoctors();
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

      {filteredAppointments.map((a) => (
        <div
          key={normalizeId(a.appointment.appointmentId)}
          style={{
            ...styles.card,
            background:
              normalizeId(selectedAppt?.appointment?._id) ===
              normalizeId(a.appointment.appointmentId)
                ? "#dcfce7"
                : "transparent",
          }}
          onClick={() => {
            setSelectedAppt(a);
            setSelectedDoctor(
              doctors.find(
                (d) =>
                  d.doctor.doctorId === a.appointment.doctorId
              )
            );
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

{selectedAppt &&
  selectedAppt.appointment.roomId &&
  selectedAppt.appointment.status === "CREATED" && (
    <div style={styles.details}>
      <p>
        Time Left:{" "}
        <strong>{formatCountdown(timeLeft)}</strong>
      </p>
{selectedAppt?.appointment?.roomId && (
  <div style={{ marginBottom: 10 }}>
    <strong>Room ID:</strong>
    <div
      style={{
        background: "#f1f5f9",
        padding: 6,
        borderRadius: 6,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{selectedAppt.appointment.roomId}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            selectedAppt.appointment.roomId
          );
          alert("Room ID copied");
        }}
      >
        Copy
      </button>
    </div>
  </div>
)}
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
          roomId={selectedAppt.appointment.roomId}
          displayName={patient.name}
          email={patient.email}
          role="PATIENT"
          onClose={() => setCallStarted(false)}
        />
      )}
    </div>
  )}

      {selectedAppt && selectedDoctor && (
        <div style={styles.details}>
          <h4>Update Appointment Slot</h4>
          {renderSlotGrid(
            selectedDoctor,
            selectedSlotKey,
            setSelectedSlotKey
          )}
          <button
            style={styles.primaryBtn}
            onClick={() => saveAppointment(true)}
          >
            Update Slot
          </button>
        </div>
      )}

      <div style={styles.details}>
        <h4>Book New Appointment</h4>

        {doctors.map((d) => (
          <div
            key={d.doctor.doctorId}
            style={styles.card}
            onClick={() => setSelectedDoctor(d)}
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

/* ================= SLOT GRID ================= */
function renderSlotGrid(doctor, selectedSlotKey, setSelectedSlotKey) {
  return (
    <div style={styles.grid}>
      {DAYS.map((day) => (
        <div key={day} style={styles.dayColumn}>
          <strong>{day}</strong>
          {(doctor.slots || [])
            .filter((s) => s.day === day)
            .map((s) => {
              const key = slotKey(s);
              return (
                <div
                  key={key}
                  onClick={() =>
                    !s.booked && setSelectedSlotKey(key)
                  }
                  style={{
                    ...styles.slot,
                    background: s.booked
                      ? "#dc2626"
                      : selectedSlotKey === key
                      ? "#16a34a"
                      : "#ffffff",
                    color:
                      s.booked || selectedSlotKey === key
                        ? "#ffffff"
                        : "#0f172a",
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
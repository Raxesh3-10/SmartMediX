import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, DoctorAPI } from "../api/api";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function Doctor() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [newSlot, setNewSlot] = useState({
    day: "MONDAY",
    startTime: "",
    endTime: "",
  });

  const [form, setForm] = useState({
    specialization: "",
    experienceYears: "",
    consultationFee: "",
    premium: false,
    upi: "",
  });

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!localStorage.getItem("JWT")) navigate("/login");
  }, [navigate]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await AuthAPI.getUser();
        setUser(userRes.data);

        const doctorRes = await DoctorAPI.getMyProfile();
        setDoctor(doctorRes.data);
      } catch {
        console.warn("Doctor profile not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    if (!window.confirm("Logout?")) return;
    await AuthAPI.logout();
    localStorage.clear();
    navigate("/login");
  };

  /* ================= CREATE PROFILE ================= */
  const handleCreateProfile = async () => {
    const res = await DoctorAPI.createProfile({
      ...form,
      experienceYears: Number(form.experienceYears),
      consultationFee: Number(form.consultationFee),
    });
    setDoctor(res.data);
  };

  /* ================= ADD SLOT WITH OVERLAP CHECK ================= */
  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

    // Convert times to numbers for easy comparison
    const newStart = parseTime(newSlot.startTime);
    const newEnd = parseTime(newSlot.endTime);

    // Check for overlap on the same day
    const overlapping = (doctor.slots || []).some((s) => {
      if (s.day !== newSlot.day) return false;
      const existingStart = parseTime(s.startTime);
      const existingEnd = parseTime(s.endTime);

      // Overlap condition:
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (overlapping) {
      alert("This slot overlaps with an existing slot ❌");
      return;
    }

    const updatedSlots = [
      ...(doctor.slots || []),
      { ...newSlot, booked: false },
    ];

    const res = await DoctorAPI.updateProfile(doctor.doctorId, {
      ...doctor,
      slots: updatedSlots,
    });

    setDoctor(res.data);
    setNewSlot({ day: "MONDAY", startTime: "", endTime: "" });
  };

  /* ===== HELPER: convert HH:MM string to number for comparison ===== */
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes; // minutes since midnight
  };


  /* ================= DELETE SLOT ================= */
  const handleDeleteSlots = async () => {
    const remaining = doctor.slots.filter(
      (s) => !selectedSlots.includes(slotKey(s))
    );

    const res = await DoctorAPI.updateProfile(doctor.doctorId, {
      ...doctor,
      slots: remaining,
    });

    setDoctor(res.data);
    setSelectedSlots([]);
  };

  const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* ===== TOP BAR ===== */}
      <div style={styles.topBar}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {!doctor ? (
        <div style={styles.box}>
          <h2>Create Doctor Profile</h2>

          <input
            style={styles.input}
            placeholder="Specialization"
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Experience Years"
            onChange={(e) =>
              setForm({ ...form, experienceYears: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Consultation Fee"
            onChange={(e) =>
              setForm({ ...form, consultationFee: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="UPI ID"
            onChange={(e) => setForm({ ...form, upi: e.target.value })}
          />

          <button style={styles.primaryBtn} onClick={handleCreateProfile}>
            Create Profile
          </button>
        </div>
      ) : (
        <>
          <div style={styles.box}>
            <h2>Doctor Dashboard</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>

          {/* ===== ADD SLOT ===== */}
          <div style={styles.box}>
            <h3>Add Availability Slot</h3>

            <select
              style={styles.select}
              value={newSlot.day}
              onChange={(e) =>
                setNewSlot({ ...newSlot, day: e.target.value })
              }
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <input
              style={styles.input}
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="time"
              value={newSlot.endTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, endTime: e.target.value })
              }
            />

            <button style={styles.primaryBtn} onClick={handleAddSlot}>
              Add Slot
            </button>
            {doctor && (
              <button style={styles.deleteBtn} onClick={handleDeleteSlots}>
                Delete Selected Slots
              </button>
            )}
          </div>

          {/* ===== SLOT GRID ===== */}
          <div style={styles.box}>
            <h3>Weekly Availability</h3>

            <div style={styles.grid}>
              {DAYS.map((day) => (
                <div key={day}>
                  <strong>{day}</strong>

                  {(doctor.slots || [])
                    .filter((s) => s.day === day)
                    .sort((a, b) =>
                      a.startTime.localeCompare(b.startTime)
                    )
                    .map((s) => {
                      const key = slotKey(s);
                      const selected = selectedSlots.includes(key);

                      return (
                        <div
                          key={key}
                          onClick={() =>
                            !s.booked &&
                            setSelectedSlots((prev) =>
                              selected
                                ? prev.filter((k) => k !== key)
                                : [...prev, key]
                            )
                          }
                          style={{
                            ...styles.slot,
                            backgroundColor: s.booked
                              ? "#16a34a"
                              : selected
                              ? "#dc2626"
                              : "#ffffff",
                          }}
                        >
                          {s.startTime} – {s.endTime}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Doctor;

const styles = {
  /* ===== PAGE ===== */
  page: {
    padding: 40,
    maxWidth: 1200,
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },

  /* ===== CENTER CARD ===== */
  box: {
    width: "420px",
    margin: "0 auto 30px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    backgroundColor: "#ffffff",
  },

  /* ===== TOP BAR ===== */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: "2px solid #e5e7eb",
  },

  logoutBtn: {
    width: 150,
    padding: "10px",
    background: "#0f172a",
    color: "#ffffff",
    border: "1px solid #0f172a",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },

  deleteBtn: {
    width: "60%",              // same as primary button
    display: "block",
    margin: "12px auto 0",     // centered + spacing
    padding: "12px",
    background: "#dc2626",
    color: "#ffffff",
    border: "1px solid #dc2626",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  

  /* ===== INPUTS ===== */
  input: {
    width: "80%",
    display: "block",
    margin: "0 auto 14px",
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    outline: "none",
  },

  select: {
    width: "80%",
    display: "block",
    margin: "0 auto 14px",
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    outline: "none",
  },

  /* ===== PRIMARY BUTTON ===== */
  primaryBtn: {
    width: "60%",
    display: "block",
    margin: "16px auto 0",
    padding: "12px",
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 500,
  },

  /* ===== WEEKLY AVAILABILITY (VERTICAL DAYS) ===== */
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr", // 👈 ONE COLUMN
    gap: 20,
    marginTop: 20,
  },

  /* ===== DAY COLUMN ===== */
  dayColumn: {
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 10,
  },

  /* ===== SLOT ===== */
  slot: {
    border: "2px solid #cbd5e1",
    padding: "8px",
    marginTop: 6,
    cursor: "pointer",
    textAlign: "center",
    fontSize: 13,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
};


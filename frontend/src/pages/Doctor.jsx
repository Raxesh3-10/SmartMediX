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

  /* ================= ADD SLOT ================= */
  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;

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
      {/* ========== TOP BAR ========== */}
      <div style={styles.topBar}>
        {doctor && (
          <button style={styles.deleteBtn} onClick={handleDeleteSlots}>
            Delete Selected Slots
          </button>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {!doctor ? (
        <>
          <h2>Create Doctor Profile</h2>

          <input
            placeholder="Specialization"
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Experience Years"
            onChange={(e) =>
              setForm({ ...form, experienceYears: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Consultation Fee"
            onChange={(e) =>
              setForm({ ...form, consultationFee: e.target.value })
            }
          />

          <input
            placeholder="UPI ID"
            onChange={(e) => setForm({ ...form, upi: e.target.value })}
          />

          <button style={styles.primaryBtn} onClick={handleCreateProfile}>
            Create Profile
          </button>
        </>
      ) : (
        <>
          <h2>Doctor Dashboard</h2>

          <p>
            <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          {/* ========== ADD SLOT FORM ========== */}
          <h3>Add Availability Slot</h3>

          <select
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
            type="time"
            value={newSlot.startTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, startTime: e.target.value })
            }
          />

          <input
            type="time"
            value={newSlot.endTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, endTime: e.target.value })
            }
          />

          <button style={styles.primaryBtn} onClick={handleAddSlot}>
            Add Slot
          </button>

          {/* ========== SLOT GRID ========== */}
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
        </>
      )}
    </div>
  );
}

export default Doctor;

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 40,
    maxWidth: 900,
    margin: "auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoutBtn: {
    background: "#0f172a",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
  },
  primaryBtn: {
    marginTop: 10,
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginTop: 15,
  },
  slot: {
    border: "1px solid #ccc",
    padding: 6,
    marginTop: 5,
    cursor: "pointer",
    textAlign: "center",
    fontSize: 14,
  },
};
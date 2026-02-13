import { useEffect, useState } from "react";
import { AuthAPI, DoctorAPI } from "../../api/api";
import "../../styles/Doctor.css"; // We will use the same classes here
import DoctorPdfReport from "../../components/DoctorPdfReport";
const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];
const CACHE_USER_KEY = "cache_doctor_user";
const CACHE_DOCTOR_KEY = "cache_doctor_profile";

function Doctor() {

  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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


  /* ================= FETCH DATA ================= */
useEffect(() => {
  const load = async () => {
    try {
      /* ===== USER CACHE ===== */
      const cachedUser = localStorage.getItem(CACHE_USER_KEY);
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      } else {
        const userRes = await AuthAPI.getUser();
        setUser(userRes.data);
        localStorage.setItem(
          CACHE_USER_KEY,
          JSON.stringify(userRes.data)
        );
      }

      /* ===== DOCTOR CACHE ===== */
      const cachedDoctor = localStorage.getItem(CACHE_DOCTOR_KEY);
      if (cachedDoctor) {
        const doctorData = JSON.parse(cachedDoctor);
        setDoctor(doctorData);

        setForm({
          specialization: doctorData.specialization || "",
          experienceYears: doctorData.experienceYears || "",
          consultationFee: doctorData.consultationFee || "",
          premium: doctorData.premium || false,
          upi: doctorData.upi || "",
        });
      } else {
        const doctorRes = await DoctorAPI.getMyProfile();
        setDoctor(doctorRes.data);
        localStorage.setItem(
          CACHE_DOCTOR_KEY,
          JSON.stringify(doctorRes.data)
        );

        setForm({
          specialization: doctorRes.data.specialization || "",
          experienceYears: doctorRes.data.experienceYears || "",
          consultationFee: doctorRes.data.consultationFee || "",
          premium: doctorRes.data.premium || false,
          upi: doctorRes.data.upi || "",
        });
      }
    } catch {
      console.warn("Doctor profile not found");
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

const reloadProfile = async () => {
  try {
    setRefreshing(true);

    localStorage.removeItem(CACHE_USER_KEY);
    localStorage.removeItem(CACHE_DOCTOR_KEY);

    const userRes = await AuthAPI.getUser();
    const doctorRes = await DoctorAPI.getMyProfile();

    setUser(userRes.data);
    setDoctor(doctorRes.data);

    localStorage.setItem(
      CACHE_USER_KEY,
      JSON.stringify(userRes.data)
    );
    localStorage.setItem(
      CACHE_DOCTOR_KEY,
      JSON.stringify(doctorRes.data)
    );
  } catch (err) {
    console.error("Refresh failed", err);
  } finally {
    setRefreshing(false);
  }
};

  /* ================= CREATE PROFILE ================= */
const handleCreateProfile = async () => {
  const res = await DoctorAPI.createProfile({
    ...form,
    experienceYears: Number(form.experienceYears),
    consultationFee: Number(form.consultationFee),
  });

  setDoctor(res.data);
  localStorage.setItem(
    CACHE_DOCTOR_KEY,
    JSON.stringify(res.data)
  );
};

  /* ================= UPDATE PROFILE (NO SLOTS) ================= */
const handleUpdateProfile = async () => {
  const res = await DoctorAPI.updateProfile(doctor.doctorId, {
    ...doctor,
    ...form,
    experienceYears: Number(form.experienceYears),
    consultationFee: Number(form.consultationFee),
  });

  setDoctor(res.data);
  localStorage.setItem(
    CACHE_DOCTOR_KEY,
    JSON.stringify(res.data)
  );

  setShowEditForm(false);
};

  /* ===== HELPER: HH:MM → minutes ===== */
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  /* ================= ADD SLOT WITH OVERLAP CHECK ================= */
const handleAddSlot = async () => {
  if (!newSlot.startTime || !newSlot.endTime) return;

  const newStart = parseTime(newSlot.startTime);
  const newEnd = parseTime(newSlot.endTime);

  const overlapping = (doctor.slots || []).some((s) => {
    if (s.day !== newSlot.day) return false;
    return newStart < parseTime(s.endTime) &&
           newEnd > parseTime(s.startTime);
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
  localStorage.setItem(
    CACHE_DOCTOR_KEY,
    JSON.stringify(res.data)
  );

  setNewSlot({ day: "MONDAY", startTime: "", endTime: "" });
};

  /* ================= DELETE SLOT ================= */
  const slotKey = (s) => `${s.day}-${s.startTime}-${s.endTime}`;

const handleDeleteSlots = async () => {
  const remaining = doctor.slots.filter(
    (s) => !selectedSlots.includes(slotKey(s))
  );

  const res = await DoctorAPI.updateProfile(doctor.doctorId, {
    ...doctor,
    slots: remaining,
  });

  setDoctor(res.data);
  localStorage.setItem(
    CACHE_DOCTOR_KEY,
    JSON.stringify(res.data)
  );

  setSelectedSlots([]);
};

  if (loading) return <div className="loading-state">Loading Profile...</div>;

  return (
    <div className="main-content">
      {!doctor ? (
        <div className="profile-box animate-fade-in">
          <h2>Create Doctor Profile</h2>
          <input className="input-field" placeholder="Specialization"
            onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <input className="input-field" type="number" placeholder="Experience Years"
            onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
          <input className="input-field" type="number" placeholder="Consultation Fee"
            onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
          <input className="input-field" placeholder="UPI ID"
            onChange={(e) => setForm({ ...form, upi: e.target.value })} />
          <button className="primary-btn" onClick={handleCreateProfile}>
            Create Profile
          </button>
        </div>
      ) : (
        <>
          {/* PROFILE SUMMARY */}
          <div className="profile-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h2>Doctor Dashboard</h2>
  <button
    className="refresh-btn"
    onClick={reloadProfile}
    disabled={refreshing}
  >
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>

            <div className="record-card">
              <div>
                <p><strong>Name:</strong> Dr. {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
              </div>
              <button className="secondary-btn" style={{ width: 'auto' }} onClick={() => setShowEditForm(!showEditForm)}>
                {showEditForm ? "Cancel Edit" : "Update Details"}
              </button>
            </div>
          </div>

          {/* EDIT FORM */}
          {showEditForm && (
            <div className="profile-box animate-fade-in">
              <h3>Edit Doctor Details</h3>
              <input className="input-field" value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              <input className="input-field" type="number" value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
              <input className="input-field" type="number" value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
              <input className="input-field" value={form.upi}
                onChange={(e) => setForm({ ...form, upi: e.target.value })} />
              <button className="primary-btn" onClick={handleUpdateProfile}>
                Save Changes
              </button>
            </div>
          )}
          <div className="profile-box">
            <DoctorPdfReport doctor={doctor} user={user} />
          </div>
          {/* ADD SLOT SECTION */}
          <div className="profile-box">
            <h3>Manage Availability</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <select className="input-field" value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input className="input-field" type="time" value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} />
              <input className="input-field" type="time" value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-btn" onClick={handleAddSlot}>Add New Slot</button>
              {selectedSlots.length > 0 && (
                <button className="logout-btn" style={{ width: '100%' }} onClick={handleDeleteSlots}>
                  Delete {selectedSlots.length} Selected
                </button>
              )}
            </div>
          </div>

          {/* GRID VIEW */}
          <div className="profile-box" style={{ maxWidth: '100%' }}>
            <h3>Weekly Schedule</h3>
            <div className="slot-grid-container">
              {DAYS.map((day) => (
                <div key={day}>
                  <div className="day-header">{day.substring(0, 3)}</div>
                  <div className="day-column">
                    {(doctor.slots || [])
                      .filter((s) => s.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((s) => {
                        const key = slotKey(s);
                        const isSelected = selectedSlots.includes(key);
                        return (
                          <div
                            key={key}
                            className={`slot-pill ${s.booked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !s.booked && setSelectedSlots(prev => 
                              isSelected ? prev.filter(k => k !== key) : [...prev, key]
                            )}
                          >
                            {s.startTime}
                          </div>
                        );
                      })}
                  </div>
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, PatientAPI } from "../../api/api";

function Patient() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    mobile: "",
    gender: "",
    age: "",
    familyId: "",
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

        const patientRes = await PatientAPI.getMyProfile();
        setPatient(patientRes.data);
      } catch {
        console.warn("Patient profile not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  /* ================= CREATE PROFILE ================= */
  const handleCreateProfile = async () => {
    const res = await PatientAPI.createProfile({
      ...form,
      age: Number(form.age),
    });
    setPatient(res.data);
  };

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>;

  return (
    <div style={styles.page}>


      {!patient ? (
        /* ===== CREATE PROFILE ===== */
        <div style={styles.box}>
          <h2>Create Patient Profile</h2>

          <input
            style={styles.input}
            placeholder="Mobile Number"
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
          />

          <select
            style={styles.input}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            style={styles.input}
            type="number"
            placeholder="Age"
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="Family ID (optional)"
            onChange={(e) =>
              setForm({ ...form, familyId: e.target.value })
            }
          />

          <button style={styles.primaryBtn} onClick={handleCreateProfile}>
            Create Profile
          </button>
        </div>
      ) : (
        <>
          {/* ===== PROFILE INFO ===== */}
          <div style={styles.box}>
            <h2>My Profile</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile:</strong> {patient.mobile}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Family ID:</strong> {patient.familyId || "—"}</p>
          </div>

          {/* ===== MEDICAL HISTORY ===== */}
          <div style={styles.box}>
            <h3>Medical History</h3>

            {patient.medicalHistory?.length ? (
              patient.medicalHistory.map((m, i) => (
                <div key={i} style={styles.record}>
                  <p><strong>Diagnosis:</strong> {m.diagnosis}</p>
                  <p><strong>Prescription:</strong> {m.prescription}</p>
                  <p><strong>Date:</strong> {new Date(m.createdAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No medical records found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Patient;

const styles = {
  page: {
    padding: 40,
    maxWidth: 1200,
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8fafc",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 15,
  },

  box: {
    width: "420px",
    margin: "0 auto 30px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    backgroundColor: "#ffffff",
  },

  input: {
    width: "90%",
    padding: "12px",
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },

  record: {
    border: "1px solid #e5e7eb",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
};
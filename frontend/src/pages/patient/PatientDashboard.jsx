import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, PatientAPI, FamilyAPI } from "../../api/api";

function Patient() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [user, setUser] = useState(null);

  const [familyMembers, setFamilyMembers] = useState([]);
  const [addingMember, setAddingMember] = useState(false);

  /* ===== PROFILE EDIT ===== */
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    mobile: "",
    gender: "",
    age: "",
  });

  /* ===== SEARCH + SELECTION ===== */
  const [allPatients, setAllPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [newMember, setNewMember] = useState({ relation: "" });

  const [form, setForm] = useState({
    mobile: "",
    gender: "",
    age: "",
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

        setEditForm({
          mobile: patientRes.data.mobile,
          gender: patientRes.data.gender,
          age: patientRes.data.age,
        });

        const famRes = await FamilyAPI.getMembers();
        setFamilyMembers(famRes.data || []);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  /* ================= HELPERS ================= */
  const refreshFamily = async () => {
    const res = await FamilyAPI.getMembers();
    setFamilyMembers(res.data || []);
  };

  /**
   * SELF + primary = true → family admin
   * DTO fields used:
   * - relation
   * - primary
   */
  const selfMember = familyMembers.find(
    (m) => m.patient.patientId === patient?.patientId
  );

  const isPrimarySelf =
    selfMember?.relation === "SELF" && selfMember?.primary === true;

  /* ================= PROFILE ================= */
  const handleCreateProfile = async () => {
    const res = await PatientAPI.createProfile({
      ...form,
      age: Number(form.age),
    });
    setPatient(res.data);
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await PatientAPI.updateProfile(patient.patientId, {
        ...editForm,
        age: Number(editForm.age),
      });
      setPatient(res.data);
      setEditingProfile(false);
    } catch {
      alert("Failed to update profile");
    }
  };

  /* ================= FAMILY ================= */
  const handleCreateFamily = async () => {
    await FamilyAPI.createFamily();
    await refreshFamily();
  };

  const handleAddMember = async () => {
    if (!isPrimarySelf) return;

    if (!selectedPatient || !newMember.relation) {
      alert("Please select a patient and relation");
      return;
    }

    await FamilyAPI.addMember({
      patientId: selectedPatient.patient.patientId,
      relation: newMember.relation,
    });

    resetAddMemberState();
    await refreshFamily();
  };

  const handleRemoveMember = async (patientId) => {
    if (!isPrimarySelf) return;
    if (!window.confirm("Remove member?")) return;

    await FamilyAPI.removeMember(patientId);
    await refreshFamily();
  };

  const handleDeleteFamily = async () => {
    if (!isPrimarySelf) return;

    if (!window.confirm("Delete entire family group?")) return;

    await FamilyAPI.removeMember(patient.patientId);
    setFamilyMembers([]);
    setPatient({ ...patient, familyId: null });
  };

  const resetAddMemberState = () => {
    setAddingMember(false);
    setSelectedPatient(null);
    setSearch("");
    setNewMember({ relation: "" });
  };

  /* ================= LOAD ALL PATIENTS ================= */
  const loadAllPatients = async () => {
    if (allPatients.length > 0) return;
    const res = await PatientAPI.getAllPatients();
    setAllPatients(res.data);
  };

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>;

  const hasFamily = patient?.familyId || familyMembers.length > 0;

  const familyPatientIds = new Set(
    familyMembers.map((m) => m.patient.patientId)
  );

  const filteredPatients = allPatients.filter((p) => {
    const pid = p.patient.patientId;

    if (pid === patient.patientId) return false;
    if (familyPatientIds.has(pid)) return false;

    return `${p.user.name} ${p.user.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div style={styles.page}>
      {!patient ? (
        <div style={styles.box}>
          <h2>Create Patient Profile</h2>

          <input
            style={styles.input}
            placeholder="Mobile"
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />

          <select
            style={styles.input}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <button style={styles.primaryBtn} onClick={handleCreateProfile}>
            Create Profile
          </button>
        </div>
      ) : (
        <>
          <div style={styles.box}>
            <h2>My Profile</h2>

            {!editingProfile ? (
              <>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Mobile:</strong> {patient.mobile}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>

                <button
                  style={styles.secondaryBtn}
                  onClick={() => setEditingProfile(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <input
                  style={styles.input}
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      mobile: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />

                <select
                  style={styles.input}
                  value={editForm.gender}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>

                <input
                  style={styles.input}
                  type="number"
                  value={editForm.age}
                  onChange={(e) =>
                    setEditForm({ ...editForm, age: e.target.value })
                  }
                />

                <button style={styles.primaryBtn} onClick={handleUpdateProfile}>
                  Save Changes
                </button>

                <button
                  style={styles.secondaryBtn}
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </button>
              </>
            )}

            {!hasFamily && (
              <button style={styles.primaryBtn} onClick={handleCreateFamily}>
                Create Family
              </button>
            )}
          </div>

          {hasFamily && (
            <div style={styles.box}>
              <h3>Family Members</h3>

              {familyMembers.map((m) => (
                <div key={m.patient.patientId} style={styles.record}>
                  <p>
                    <strong>
                      {m.user.name} ({m.relation})
                    </strong>
                    {m.primary && " ⭐"}
                  </p>
                  <p>{m.user.email}</p>

                  {isPrimarySelf &&
                    m.patient.patientId !== patient.patientId && (
                      <button
                        style={styles.dangerBtn}
                        onClick={() =>
                          handleRemoveMember(m.patient.patientId)
                        }
                      >
                        Remove
                      </button>
                    )}
                </div>
              ))}

              {isPrimarySelf && familyMembers.length === 1 && (
                <button style={styles.dangerBtn} onClick={handleDeleteFamily}>
                  Delete Family
                </button>
              )}

              {isPrimarySelf && !addingMember && (
                <button
                  style={styles.secondaryBtn}
                  onClick={() => {
                    setAddingMember(true);
                    loadAllPatients();
                  }}
                >
                  Add Member
                </button>
              )}

              {isPrimarySelf && addingMember && (
                <>
                  <input
                    style={styles.input}
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {filteredPatients.map((p) => (
                    <div
                      key={p.patient.patientId}
                      style={styles.searchItem}
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearch("");
                      }}
                    >
                      <strong>{p.user.name}</strong>
                      <div>{p.user.email}</div>
                    </div>
                  ))}

                  {selectedPatient && (
                    <div style={styles.selected}>
                      Selected: <strong>{selectedPatient.user.name}</strong>
                    </div>
                  )}

                  <input
                    style={styles.input}
                    placeholder="Relation"
                    value={newMember.relation}
                    onChange={(e) =>
                      setNewMember({ relation: e.target.value })
                    }
                  />

                  <button style={styles.primaryBtn} onClick={handleAddMember}>
                    Save Member
                  </button>

                  <button
                    style={styles.secondaryBtn}
                    onClick={resetAddMemberState}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Patient;

/* ================= STYLES ================= */
const styles = {
  page: { padding: 40, maxWidth: 1200, margin: "auto" },
  box: {
    width: 420,
    margin: "0 auto 30px",
    padding: 24,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
  },
  input: { width: "90%", padding: 12, marginBottom: 10 },
  primaryBtn: {
    width: "100%",
    padding: 12,
    background: "#2563eb",
    color: "#fff",
    border: "none",
  },
  secondaryBtn: { width: "100%", padding: 12, marginTop: 10 },
  dangerBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    marginTop: 8,
  },
  record: { padding: 12, border: "1px solid #ddd", marginBottom: 10 },
  searchItem: {
    padding: 8,
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  selected: { padding: 10, background: "#f1f5f9", marginBottom: 10 },
};
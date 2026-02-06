import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PatientAPI, FamilyAPI } from "../../api/api";
import "../../styles/Patient.css";
const CACHE_PATIENT_PROFILE = "cache_patient_profile";
const CACHE_FAMILY_MEMBERS = "cache_family_members";
const CACHE_ALL_PATIENTS = "cache_all_patients";

function Patient() {
  // Getting user and initial patient data from the Layout's Outlet context
  const { user, patient: initialPatient } = useOutletContext();

  const [patient, setPatient] = useState(initialPatient);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ 
    mobile: initialPatient?.mobile || "", 
    gender: initialPatient?.gender || "", 
    age: initialPatient?.age || "" 
  });
  
  const [allPatients, setAllPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newMember, setNewMember] = useState({ relation: "" });
  const [form, setForm] = useState({ mobile: "", gender: "", age: "" });

useEffect(() => {
  const loadFamily = async () => {
    try {
      const cached = localStorage.getItem(CACHE_FAMILY_MEMBERS);

      if (cached) {
        setFamilyMembers(JSON.parse(cached));
        return;
      }

      const famRes = await FamilyAPI.getMembers();
      const data = famRes.data || [];

      setFamilyMembers(data);
      localStorage.setItem(
        CACHE_FAMILY_MEMBERS,
        JSON.stringify(data)
      );
    } catch (err) {
      console.error("Error loading family:", err);
    }
  };

  if (patient) loadFamily();
}, [patient]);

const refreshFamily = async () => {
  const res = await FamilyAPI.getMembers();
  const data = res.data || [];

  setFamilyMembers(data);
  localStorage.setItem(
    CACHE_FAMILY_MEMBERS,
    JSON.stringify(data)
  );
};

  const selfMember = familyMembers.find((m) => m.patient.patientId === patient?.patientId);
  const isPrimarySelf = selfMember?.relation === "SELF" && selfMember?.primary === true;

const handleCreateProfile = async () => {
  try {
    const res = await PatientAPI.createProfile({
      ...form,
      age: Number(form.age),
    });

    setPatient(res.data);
    localStorage.setItem(
      CACHE_PATIENT_PROFILE,
      JSON.stringify(res.data)
    );
  } catch {
    alert("Error creating profile");
  }
};

const handleUpdateProfile = async () => {
  try {
    const res = await PatientAPI.updateProfile(
      patient.patientId,
      { ...editForm, age: Number(editForm.age) }
    );

    setPatient(res.data);
    localStorage.setItem(
      CACHE_PATIENT_PROFILE,
      JSON.stringify(res.data)
    );

    setEditingProfile(false);
  } catch {
    alert("Failed to update profile");
  }
};

  const handleCreateFamily = async () => {
    await FamilyAPI.createFamily();
    await refreshFamily();
  };

const handleAddMember = async () => {
  if (!isPrimarySelf) return;
  if (!selectedPatient || !newMember.relation) {
    alert("Please select a patient and enter a relation");
    return;
  }

  try {
    await FamilyAPI.addMember({
      patientId: selectedPatient.patient.patientId,
      relation: newMember.relation,
    });

    resetAddMemberState();
    await refreshFamily();
  } catch {
    alert("Error adding member");
  }
};

const handleRemoveMember = async (patientId) => {
  if (!isPrimarySelf) return;
  if (!window.confirm("Remove this member from your family group?")) return;

  await FamilyAPI.removeMember(patientId);
  await refreshFamily();
};

  const resetAddMemberState = () => {
    setAddingMember(false);
    setSelectedPatient(null);
    setSearch("");
    setNewMember({ relation: "" });
  };

const loadAllPatients = async () => {
  const cached = localStorage.getItem(CACHE_ALL_PATIENTS);

  if (cached) {
    setAllPatients(JSON.parse(cached));
    return;
  }

  const res = await PatientAPI.getAllPatients();
  setAllPatients(res.data);

  localStorage.setItem(
    CACHE_ALL_PATIENTS,
    JSON.stringify(res.data)
  );
};

  const hasFamily = patient?.familyId || familyMembers.length > 0;
  const familyPatientIds = new Set(familyMembers.map((m) => m.patient.patientId));
  
  const filteredPatients = allPatients.filter((p) => {
    const pid = p.patient.patientId;
    if (pid === patient.patientId) return false;
    if (familyPatientIds.has(pid)) return false;
    return `${p.user.name} ${p.user.email}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <main className="main-content">
      {!patient ? (
        <div className="profile-box">
          <h2>Complete Your Profile</h2>
          <input className="input-field" placeholder="Mobile Number" onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <select className="input-field" onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input className="input-field" type="number" placeholder="Age" onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <button className="primary-btn" onClick={handleCreateProfile}>Create My Profile</button>
        </div>
      ) : (
        <>
          {/* PROFILE CARD */}
          <div className="profile-box">
            <h2>My Health Profile</h2>
            {!editingProfile ? (
              <div className="profile-details">
                <p><strong>Full Name:</strong> {user?.name}</p>
                <p><strong>Email Address:</strong> {user?.email}</p>
                <p><strong>Mobile:</strong> {patient.mobile}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <button className="secondary-btn" onClick={() => setEditingProfile(true)}>Update Details</button>
              </div>
            ) : (
              <>
                <input className="input-field" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
                <select className="input-field" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <input className="input-field" type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                <button className="primary-btn" onClick={handleUpdateProfile}>Save Changes</button>
                <button className="secondary-btn" onClick={() => setEditingProfile(false)}>Cancel</button>
              </>
            )}
            {!hasFamily && (
              <button className="primary-btn" style={{marginTop: '15px'}} onClick={handleCreateFamily}>
                Create Family Group
              </button>
            )}
          </div>

          {/* FAMILY CARD */}
          {hasFamily && (
            <div className="profile-box">
              <h3>Family Health Group</h3>
              {familyMembers.map((m) => (
                <div key={m.patient.patientId} className="record-card">
                  <div>
                    <strong>{m.user.name}</strong> ({m.relation}) {m.primary && "⭐"}
                    <div style={{fontSize: '0.85rem', color: '#64748b'}}>{m.user.email}</div>
                  </div>
                  {isPrimarySelf && m.patient.patientId !== patient.patientId && (
                    <button className="danger-btn" onClick={() => handleRemoveMember(m.patient.patientId)}>Remove</button>
                  )}
                </div>
              ))}
              
              {isPrimarySelf && !addingMember && (
                <button className="secondary-btn" onClick={() => { setAddingMember(true); loadAllPatients(); }}>+ Add Member</button>
              )}

              {addingMember && (
                <div style={{marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
                  <input className="input-field" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  <div style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '10px'}}>
                    {filteredPatients.map((p) => (
                      <div key={p.patient.patientId} className="search-item" style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee'}} onClick={() => { setSelectedPatient(p); setSearch(""); }}>
                        {p.user.name} ({p.user.email})
                      </div>
                    ))}
                  </div>
                  {selectedPatient && <div style={{margin: '10px 0', fontWeight: 'bold', color: '#2563eb'}}>Selected: {selectedPatient.user.name}</div>}
                  <input className="input-field" placeholder="Relationship (e.g. Father, Spouse)" value={newMember.relation} onChange={(e) => setNewMember({ relation: e.target.value })} />
                  <button className="primary-btn" onClick={handleAddMember}>Confirm Addition</button>
                  <button className="secondary-btn" onClick={resetAddMemberState}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Patient;
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ChatbotAssistant from "../../components/ChatbotAssistant";
import { PatientAPI, FamilyAPI } from "../../api/api";
import PatientMedicalRecords from "../../components/PatientMedicalRecords";
import "../../styles/Patient.css";

const CACHE_PATIENT_PROFILE = "cache_patient_profile";
const CACHE_FAMILY_MEMBERS = "cache_family_members";
const CACHE_ALL_PATIENTS = "cache_all_patients";

function Patient() {

  const { user, patient: initialPatient } = useOutletContext();

  const [patient, setPatient] = useState(initialPatient);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);

  const [addingMember, setAddingMember] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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


  const reloadPatientData = async () => {

    try {

      setRefreshing(true);

      localStorage.removeItem(CACHE_PATIENT_PROFILE);
      localStorage.removeItem(CACHE_FAMILY_MEMBERS);
      localStorage.removeItem(CACHE_ALL_PATIENTS);

      const profileRes = await PatientAPI.getMyProfile();
      const familyRes = await FamilyAPI.getMembers();

      setPatient(profileRes.data);
      setFamilyMembers(familyRes.data || []);

      localStorage.setItem(
        CACHE_PATIENT_PROFILE,
        JSON.stringify(profileRes.data)
      );

      localStorage.setItem(
        CACHE_FAMILY_MEMBERS,
        JSON.stringify(familyRes.data || [])
      );

    } catch (err) {
      console.error("Refresh failed", err);
    }
    finally {
      setRefreshing(false);
    }
  };


  const selfMember = familyMembers.find(
    (m) => m.patient.patientId === patient?.patientId
  );

  const isPrimarySelf =
    selfMember?.relation === "SELF" &&
    selfMember?.primary === true;


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

    if (!window.confirm("Remove this member from your family group?"))
      return;

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


  const hasFamily =
    patient?.familyId ||
    familyMembers.length > 0;


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
    <main className="main-content">

      {!patient ? (

        <div className="profile-box">

          <h2>Complete Your Profile</h2>

          <input
            className="input-field"
            placeholder="Mobile Number"
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
          />

          <select
            className="input-field"
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
            className="input-field"
            type="number"
            placeholder="Age"
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
          />

          <button
            className="primary-btn"
            onClick={handleCreateProfile}
          >
            Create My Profile
          </button>

        </div>

      ) : (

        <>

          {/* PROFILE CARD */}

          <div className="profile-box">

            <h2>My Health Profile</h2>

            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile:</strong> {patient.mobile}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>

          </div>


          {/* MY RECORDS */}

          <PatientMedicalRecords
            user={user}
            patient={patient}
          />


          {/* FAMILY */}

          {hasFamily && (

            <div className="profile-box">

              <h3>Family Health Group</h3>

              {familyMembers.map((m) => (

                <div
                  key={m.patient.patientId}
                  className="record-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedFamilyMember(m)}
                >

                  <strong>{m.user.name}</strong> ({m.relation}) {m.primary && "⭐"}

                </div>

              ))}

            </div>

          )}


          {/* FAMILY MEMBER DETAILS */}

          {selectedFamilyMember && (

            <div className="profile-box">

              <h3>Family Member Details</h3>

              <p>
                <strong>Name:</strong> {selectedFamilyMember.user.name}
              </p>

              <p>
                <strong>Email:</strong> {selectedFamilyMember.user.email}
              </p>

              <p>
                <strong>Relation:</strong> {selectedFamilyMember.relation}
              </p>

              <p>
                <strong>Age:</strong> {selectedFamilyMember.patient.age}
              </p>

              <p>
                <strong>Gender:</strong> {selectedFamilyMember.patient.gender}
              </p>

              <PatientMedicalRecords
                user={selectedFamilyMember.user}
                patient={selectedFamilyMember.patient}
              />

              <button
                className="secondary-btn"
                onClick={() => setSelectedFamilyMember(null)}
              >
                Close
              </button>

            </div>

          )}

        </>
      )}

      <ChatbotAssistant />

    </main>
  );
}

export default Patient;
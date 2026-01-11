import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import DoctorChatBox from "../../components/DoctorChatBox";
import { useOutletContext } from "react-router-dom";

export default function DoctorChatPage() {
  const { user, doctor } = useOutletContext();

  const [patients, setPatients] = useState([]);
  const [mode, setMode] = useState("CHATS"); // CHATS | NEW
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, [mode]);

  const loadPatients = async () => {
    const res =
      mode === "CHATS"
        ? await ChatAPI.getDoctorChatPatients(doctor.doctorId)
        : await ChatAPI.getDoctorNewPatients(doctor.doctorId);

    setPatients(res.data);
  };

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <strong>Patients</strong>
          <div>
            <button
              style={mode === "CHATS" ? styles.activeBtn : styles.btn}
              onClick={() => setMode("CHATS")}
            >
              Chats
            </button>
            <button
              style={mode === "NEW" ? styles.activeBtn : styles.btn}
              onClick={() => setMode("NEW")}
            >
              New
            </button>
          </div>
        </div>

        {patients.map((p) => {
          const isSelected =
            selectedPatient?.patientId === p.patient.patientId;

          return (
            <div
              key={p.patient.patientId}
              style={{
                ...styles.chatItem,
                backgroundColor: isSelected ? "#d1fae5" : "#ffffff",
              }}
              onClick={() => setSelectedPatient(p.patient)}
            >
              <strong>{p.user?.name}</strong>
              <div style={styles.email}>{p.user?.email}</div>
            </div>
          );
        })}
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.chatArea}>
        {selectedPatient ? (
          <DoctorChatBox
            user={user}
            doctor={doctor}
            patient={selectedPatient}
          />
        ) : (
          <div style={styles.empty}>
            Select a patient to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    border: "1px solid #ccc",
  },
  sidebar: {
    width: "30%",
    borderRight: "1px solid #ddd",
    overflowY: "auto",
  },
  sidebarHeader: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    marginLeft: 6,
    padding: "4px 8px",
    cursor: "pointer",
  },
  activeBtn: {
    marginLeft: 6,
    padding: "4px 8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  chatItem: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  email: {
    fontSize: "12px",
    color: "#555",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  empty: {
    margin: "auto",
    color: "#999",
    fontSize: "16px",
  },
};
import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import PatientChatBox from "../../components/PatientChatBox";
import { useOutletContext } from "react-router-dom";

export default function PatientChatPage() {
  const { user, patient } = useOutletContext();

  const [doctors, setDoctors] = useState([]);
  const [mode, setMode] = useState("CHATS"); // CHATS | NEW
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, [mode]);

  const loadDoctors = async () => {
    const res =
      mode === "CHATS"
        ? await ChatAPI.getPatientChatDoctors(patient.patientId)
        : await ChatAPI.getPatientNewDoctors(patient.patientId);

    setDoctors(res.data);
  };

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <strong>Doctors</strong>
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

        {doctors.map((d) => {
          const isSelected =
            selectedDoctor?.doctorId === d.doctor.doctorId;

          return (
            <div
              key={d.doctor.doctorId}
              style={{
                ...styles.chatItem,
                backgroundColor: isSelected ? "#d1e7ff" : "#ffffff",
              }}
              onClick={() => setSelectedDoctor(d.doctor)}
            >
              <strong>{d.user?.name}</strong>
              <div style={styles.email}>{d.user?.email}</div>
            </div>
          );
        })}
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.chatArea}>
        {selectedDoctor ? (
          <PatientChatBox
            user={user}
            patient={patient}
            doctor={selectedDoctor}
          />
        ) : (
          <div style={styles.empty}>
            Select a doctor to start chatting
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
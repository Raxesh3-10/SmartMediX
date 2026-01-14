import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import PatientChatBox from "../../components/PatientChatBox";
import { useOutletContext } from "react-router-dom";

export default function PatientChatPage() {
  const { user, patient } = useOutletContext();

  const [mode, setMode] = useState("CHATS"); // CHATS | NEW
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
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

  const filtered = doctors.filter(
    (d) =>
      d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        {/* TOP BUTTONS */}
        <div style={styles.topBar}>
          <button
            onClick={() => setMode("CHATS")}
            style={{
              ...styles.tabBtn,
              ...(mode === "CHATS" ? styles.activeTab : {}),
            }}
          >
            Chats
          </button>
          <button
            onClick={() => setMode("NEW")}
            style={{
              ...styles.tabBtn,
              ...(mode === "NEW" ? styles.activeTab : {}),
            }}
          >
            New
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* DOCTOR LIST */}
        <div style={styles.list}>
          {filtered.map((d) => {
            const isActive =
              selectedDoctor?.doctorId === d.doctor.doctorId;

            return (
              <div
                key={d.doctor.doctorId}
                style={{
                  ...styles.chatItem,
                  ...(isActive ? styles.activeChat : {}),
                }}
                onClick={() => setSelectedDoctor(d)}
              >
                <strong>{d.user?.name}</strong>
                <div style={styles.email}>{d.user?.email}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT CHAT */}
      <div style={styles.chatArea}>
        {selectedDoctor ? (
          <PatientChatBox
            user={user}
            patient={patient}
            doctor={selectedDoctor.doctor}
            doctorUser={selectedDoctor.user}
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

/* ================= PAGE STYLES ================= */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f0f2f5",
  },
  sidebar: {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #ddd",
    background: "#fff",
  },
  topBar: {
    display: "flex",
    padding: 10,
    gap: 8,
    borderBottom: "1px solid #ddd",
  },
  tabBtn: {
    flex: 1,
    padding: "6px 0",
    border: "1px solid #ccc",
    background: "#f8f9fa",
    cursor: "pointer",
  },
  activeTab: {
    background: "#25d366",
    color: "#fff",
    border: "1px solid #25d366",
  },
  search: {
    margin: 10,
    padding: 8,
    border: "1px solid #ccc",
  },
  list: {
    flex: 1,
    overflowY: "auto",
  },
  chatItem: {
    padding: 12,
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  activeChat: {
    background: "#dcf8c6",
  },
  email: {
    fontSize: 12,
    color: "#666",
  },
  chatArea: {
    flex: 1,
    display: "flex",
  },
  empty: {
    margin: "auto",
    color: "#999",
    fontSize: 16,
  },
};
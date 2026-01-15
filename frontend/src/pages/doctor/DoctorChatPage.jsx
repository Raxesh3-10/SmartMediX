import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import DoctorChatBox from "../../components/DoctorChatBox";
import { useOutletContext } from "react-router-dom";

export default function DoctorChatPage() {
  const { user, doctor } = useOutletContext();

  const [mode, setMode] = useState("CHATS");
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [unreadMap, setUnreadMap] = useState({}); // patientId -> count

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadPatients = async () => {
    const res =
      mode === "CHATS"
        ? await ChatAPI.getDoctorChatPatients(doctor.doctorId)
        : await ChatAPI.getDoctorNewPatients(doctor.doctorId);

    const unread = {};

    for (const p of res.data) {
      const history = await ChatAPI.getChatHistory(
        doctor.doctorId,
        p.patient.patientId
      );

      unread[p.patient.patientId] = history.data.filter(
        (m) => !m.read && m.senderRole === "PATIENT"
      ).length;
    }

    setUnreadMap(unread);
    setPatients(res.data);
  };

  const filtered = patients
    .filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(search.toLowerCase())
    )
    // 🔑 UNREAD FIRST
    .sort((a, b) => {
      const ua = unreadMap[a.patient.patientId] || 0;
      const ub = unreadMap[b.patient.patientId] || 0;
      return ub - ua;
    });

  return (
    <div style={styles.page}>
      {/* ================= LEFT SIDEBAR ================= */}
      <div style={styles.sidebar}>
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
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* PATIENT LIST */}
        <div style={styles.list}>
          {filtered.map((p) => {
            const pid = p.patient.patientId;
            const unread = unreadMap[pid] || 0;
            const isActive =
              selectedPatient?.patient.patientId === pid;

            return (
              <div
                key={pid}
                style={{
                  ...styles.chatItem,
                  ...(isActive ? styles.activeChat : {}),
                }}
                onClick={() => setSelectedPatient(p)}
              >
                <strong>
                  {p.user?.name}
                  {unread > 0 && ` (${unread})`}
                </strong>

                <div style={styles.email}>
                  {p.user?.email}
                  {unread > 0 && " • unread"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= RIGHT CHAT ================= */}
      <div style={styles.chatArea}>
        {selectedPatient ? (
          <DoctorChatBox
            user={user}
            doctor={doctor}
            patient={selectedPatient.patient}
            patientUser={selectedPatient.user}
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

/* ================= FIXED WHATSAPP-LIKE STYLES ================= */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f0f2f5",
  },

  /* ===== SIDEBAR ===== */
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
    background: "#dcf8c6", // WhatsApp green highlight
  },

  email: {
    fontSize: 12,
    color: "#666",
  },

  /* ===== CHAT AREA ===== */
  chatArea: {
    flex: 1,
  },

  empty: {
    margin: "auto",
    color: "#999",
    fontSize: 16,
  },
};
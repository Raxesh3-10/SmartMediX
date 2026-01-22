import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import DoctorChatBox from "../../components/DoctorChatBox";
import { useOutletContext } from "react-router-dom";
import "../../styles/Doctor.css"; // We will use the same classes here

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
    .sort((a, b) => {
      const ua = unreadMap[a.patient.patientId] || 0;
      const ub = unreadMap[b.patient.patientId] || 0;
      return ub - ua;
    });

  return (
    <div className="chat-page-container">
      {/* ================= LEFT SIDEBAR ================= */}
      <div className="chat-sidebar">
        <div className="chat-tabs">
          <button
            onClick={() => setMode("CHATS")}
            className={`chat-tab-btn ${mode === "CHATS" ? "active" : ""}`}
          >
            My Conversations
          </button>
          <button
            onClick={() => setMode("NEW")}
            className={`chat-tab-btn ${mode === "NEW" ? "active" : ""}`}
          >
            New Requests
          </button>
        </div>

        {/* SEARCH */}
        <div className="chat-search-wrapper">
          <input
            className="input-field"
            placeholder="Search patient by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* PATIENT LIST */}
        <div className="doctor-list-scroll">
          {filtered.length > 0 ? (
            filtered.map((p) => {
              const pid = p.patient.patientId;
              const unread = unreadMap[pid] || 0;
              const isActive = selectedPatient?.patient.patientId === pid;

              return (
                <div
                  key={pid}
                  className={`doctor-item ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <div className="doctor-name-row">
                    <strong>{p.user?.name}</strong>
                    {unread > 0 && <span className="unread-badge">{unread}</span>}
                  </div>

                  <div className="doctor-subtext">
                    {p.user?.email}
                    {unread > 0 && <span style={{ color: "#ef4444", fontWeight: "bold" }}> • New Message</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-list-msg">No patients found in {mode.toLowerCase()}</div>
          )}
        </div>
      </div>

      {/* ================= RIGHT CHAT AREA ================= */}
      <div className="chat-main-window">
        {selectedPatient ? (
          <DoctorChatBox
            user={user}
            doctor={doctor}
            patient={selectedPatient.patient}
            patientUser={selectedPatient.user}
          />
        ) : (
          <div className="chat-empty-state">
            <div className="empty-icon">💬</div>
            <h3>Patient Consultation Room</h3>
            <p>Select a patient from the left to view medical history and chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
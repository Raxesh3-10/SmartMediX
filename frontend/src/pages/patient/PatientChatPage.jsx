import { useEffect, useState } from "react";
import { ChatAPI } from "../../api/api";
import PatientChatBox from "../../components/PatientChatBox";
import { useOutletContext } from "react-router-dom";
import "../../styles/Patient.css"; // Using the shared CSS

export default function PatientChatPage() {
  const { user, patient } = useOutletContext();

  const [mode, setMode] = useState("CHATS"); // CHATS | NEW
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [unreadMap, setUnreadMap] = useState({}); // doctorId -> count

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadDoctors = async () => {
    const res =
      mode === "CHATS"
        ? await ChatAPI.getPatientChatDoctors(patient.patientId)
        : await ChatAPI.getPatientNewDoctors(patient.patientId);

    const unread = {};

    for (const d of res.data) {
      const history = await ChatAPI.getPatientChatHistory(
        patient.patientId,
        d.doctor.doctorId
      );

      unread[d.doctor.doctorId] = history.data.filter(
        (m) => !m.read && m.senderRole === "DOCTOR"
      ).length;
    }

    setUnreadMap(unread);
    setDoctors(res.data);
  };

  const filtered = doctors
    .filter(
      (d) =>
        d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.user?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const ua = unreadMap[a.doctor.doctorId] || 0;
      const ub = unreadMap[b.doctor.doctorId] || 0;
      return ub - ua;
    });

  return (
    <div className="chat-page-container">
      {/* LEFT SIDEBAR (Doctor List) */}
      <div className="chat-sidebar">
        {/* TABS FOR CHATS / NEW */}
        <div className="chat-tabs">
          <button
            className={`chat-tab-btn ${mode === "CHATS" ? "active" : ""}`}
            onClick={() => setMode("CHATS")}
          >
            Recent Chats
          </button>
          <button
            className={`chat-tab-btn ${mode === "NEW" ? "active" : ""}`}
            onClick={() => setMode("NEW")}
          >
            Find Doctors
          </button>
        </div>

        {/* SEARCH BOX */}
        <div className="chat-search-wrapper">
          <input
            className="input-field"
            style={{ marginBottom: 0 }}
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* DOCTOR LIST */}
        <div className="doctor-list-scroll">
          {filtered.length > 0 ? (
            filtered.map((d) => {
              const did = d.doctor.doctorId;
              const unread = unreadMap[did] || 0;
              const isActive = selectedDoctor?.doctor.doctorId === did;

              return (
                <div
                  key={did}
                  className={`doctor-item ${isActive ? "active" : ""} ${unread > 0 ? "has-unread" : ""}`}
                  onClick={() => setSelectedDoctor(d)}
                >
                  <div className="doctor-info">
                    <div className="doctor-name-row">
                      <strong>{d.user?.name}</strong>
                      {unread > 0 && <span className="unread-badge">{unread}</span>}
                    </div>
                    <div className="doctor-subtext">{d.user?.email}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-list-msg">No doctors found.</div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE (Chat Window) */}
      <div className="chat-main-window">
        {selectedDoctor ? (
          <PatientChatBox
            user={user}
            patient={patient}
            doctor={selectedDoctor.doctor}
            doctorUser={selectedDoctor.user}
          />
        ) : (
          <div className="chat-empty-state">
            <div className="empty-icon">💬</div>
            <h3>Your Consultations</h3>
            <p>Select a doctor from the list to view history or start a new conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
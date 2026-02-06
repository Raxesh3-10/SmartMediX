import { useEffect, useRef, useState } from "react";
import { ChatAPI, ChatFileAPI } from "../api/api";
import { encryptMessage, decryptMessage } from "../utils/chatCrypto";
import "../styles/Doctor.css";

/* ================= DATE FORMATTER ================= */
const formatDateTime = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} • ${time}`;
};

const openPdfFromRawUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("Failed to open PDF:", err);
    alert("Unable to open document");
  }
};

export default function PatientChatBox({
  user,
  doctorUser,
  patient,
  doctor,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [activeMessageId, setActiveMessageId] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ================= LOAD CHAT ================= */
  useEffect(() => {
    if (patient && doctor) loadChat();
  }, [patient?.patientId, doctor?.doctorId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    const res = await ChatAPI.getPatientChatHistory(
      patient.patientId,
      doctor.doctorId
    );

    const decrypted = res.data.map((m) => ({
      ...m,
      message: m.message
        ? decryptMessage(
            m.message,
            doctor.doctorId,
            patient.patientId
          )
        : "",
    }));

    const readMessages = decrypted.filter(
      (m) => m.read || m.senderRole === "PATIENT"
    );

    const unreadMessages = decrypted.filter(
      (m) => !m.read && m.senderRole === "DOCTOR"
    );

    setMessages([...readMessages, ...unreadMessages]);

    if (unreadMessages.length > 0) {
      await ChatAPI.markChatAsRead(
        doctor.doctorId,
        patient.patientId
      );
    }
  };

  /* ================= DELETE MESSAGE ================= */
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    await ChatAPI.deleteMessage(messageId);
    setActiveMessageId(null);
    await loadChat();
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const fileUrls = [];
      for (const file of selectedFiles) {
        let res;
        if (file.type.startsWith("image/")) {
          res = await ChatFileAPI.uploadImage(
            file,
            patient.patientId
          );
        } else if (file.type === "application/pdf") {
          res = await ChatFileAPI.uploadDocument(
            file,
            patient.patientId
          );
        } else {
          alert("Only images and PDF files are allowed");
          continue;
        }
        fileUrls.push(res.data);
      }

      const encrypted = encryptMessage(
        text,
        doctor.doctorId,
        patient.patientId
      );

      await ChatAPI.sendMessage({
        doctorId: doctor.doctorId,
        patientId: patient.patientId,
        senderRole: "PATIENT",
        senderId: patient.patientId,
        message: encrypted,
        fileUrls,
      });

      setText("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadChat();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-box-container">
      {/* HEADER */}
      <div className="chat-header-bar">
        <div className="patient-info">
          <div className="avatar-circle doctor-avatar">
            {doctorUser?.name?.charAt(0)}
          </div>
          <div>
            <div className="chat-name">
              Dr. {doctorUser?.name || "Doctor"}
            </div>
            <div className="chat-sub">{doctorUser?.email}</div>
          </div>
        </div>
        <div className="doctor-info-tag">
          <div className="chat-name text-right">
            {user?.name}
          </div>
          <div className="chat-sub text-right">
            Patient Portal
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="chat-messages-scroll">
        {messages.map((m) => {
          const isPatient = m.senderRole === "PATIENT";
          const isUnreadDoctor =
            !m.read && m.senderRole === "DOCTOR";

          return (
            <div
              key={m.messageId}
              className={`message-bubble ${
                isPatient ? "doctor-msg" : "patient-msg"
              } ${isUnreadDoctor ? "unread-glow" : ""}`}
              onClick={() =>
                isPatient
                  ? setActiveMessageId(
                      activeMessageId === m.messageId
                        ? null
                        : m.messageId
                    )
                  : null
              }
            >
              {m.message && (
                <div className="message-text">{m.message}</div>
              )}

              {m.fileUrls?.map((url, i) => (
                <div key={i} className="file-attachment">
                  {url.includes("/images/") ? (
                    <img
                      src={url}
                      alt="attachment"
                      className="chat-img-preview"
                      onClick={() =>
                        window.open(
                          url,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    />
                  ) : (
                    <button
                      className="pdf-link"
                      onClick={() =>
                        openPdfFromRawUrl(url)
                      }
                    >
                      📄 Medical Document (PDF)
                    </button>
                  )}
                </div>
              ))}

              <div className="message-time">
                {formatDateTime(m.sentAt)}
              </div>

              {/* DELETE OPTION */}
              {isPatient &&
                activeMessageId === m.messageId && (
                  <div
                    className="delete-message-btn"
                    onClick={() =>
                      deleteMessage(m.messageId)
                    }
                  >
                    Delete
                  </div>
                )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input-wrapper">
        <div className="file-preview-area">
          {selectedFiles.length > 0 && (
            <span className="file-counter">
              📎 {selectedFiles.length} file(s) ready
            </span>
          )}
        </div>

        <div className="input-row">
          <label className="file-upload-label">
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={(e) =>
                setSelectedFiles([...e.target.files])
              }
            />
            Click to Upload
          </label>

          <input
            className="chat-input-field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to the doctor..."
            onKeyPress={(e) =>
              e.key === "Enter" && sendMessage()
            }
          />

          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={uploading}
          >
            {uploading ? "..." : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}
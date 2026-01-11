import { useEffect, useRef, useState } from "react";
import { ChatAPI, ChatFileAPI } from "../api/api";

export default function DoctorChatBox({ user, doctor, patient }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (doctor && patient) {
      loadChat();
    }
  }, [doctor, patient]);

  const loadChat = async () => {
    const res = await ChatAPI.getChatHistory(
      doctor.doctorId,
      patient.patientId
    );
    setMessages(res.data);
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!text.trim() && !selectedFile) return;

    setUploading(true);
    try {
      let fileUrls = [];

      if (selectedFile) {
        let res;

        if (selectedFile.type.startsWith("image/")) {
          res = await ChatFileAPI.uploadImage(
            selectedFile,
            doctor.doctorId
          );
        } else {
          res = await ChatFileAPI.uploadDocument(
            selectedFile,
            doctor.doctorId
          );
        }

        fileUrls.push(res.data);
      }

      await ChatAPI.sendMessage({
        doctorId: doctor.doctorId,
        patientId: patient.patientId,
        senderRole: "DOCTOR",
        senderId: doctor.doctorId,
        message: text,
        fileUrls,
      });

      /* RESET */
      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      loadChat();
    } finally {
      setUploading(false);
    }
  };

  /* ================= FILE TYPE CHECK ================= */

  const isChatImage = (url) =>
    url.includes("smartmedix/chat/images");

  const isChatDocument = (url) =>
    url.includes("smartmedix/chat/documents");

  /* ================= FRONTEND PDF OPEN FIX ================= */

  const openPdfInline = async (url) => {
    try {
      const response = await fetch(
        url.includes("?")
          ? `${url}&fl_attachment=false`
          : `${url}?fl_attachment=false`
      );

      const blob = await response.blob();

      const pdfBlob = new Blob([blob], {
        type: "application/pdf",
      });

      const blobUrl = window.URL.createObjectURL(pdfBlob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Failed to open PDF", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <strong>Chat with Patient</strong>
        <div style={styles.userInfo}>
          {user.name}
          <br />
          <small>{user.email}</small>
        </div>
      </div>

      {/* CHAT BOX */}
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf:
                m.senderRole === "DOCTOR" ? "flex-end" : "flex-start",
              backgroundColor:
                m.senderRole === "DOCTOR" ? "#d1fae5" : "#f1f1f1",
            }}
          >
            {m.message && <div>{m.message}</div>}

            {m.fileUrls?.map((url, idx) => (
              <div key={idx} style={{ marginTop: 6 }}>
                {/* IMAGE */}
                {isChatImage(url) && (
                  <img
                    src={url}
                    alt="attachment"
                    style={styles.image}
                  />
                )}

                {/* PDF / DOCUMENT */}
                {isChatDocument(url) && (
                  <button
                    onClick={() => openPdfInline(url)}
                    style={styles.docButton}
                  >
                    📄 Open document
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* INPUT BAR */}
      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button onClick={sendMessage} disabled={uploading}>
          {uploading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "10px",
    borderBottom: "1px solid #ccc",
    display: "flex",
    justifyContent: "space-between",
  },
  userInfo: {
    textAlign: "right",
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  message: {
    maxWidth: "70%",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "14px",
  },
  image: {
    maxWidth: "220px",
    borderRadius: "6px",
    marginTop: "4px",
  },
  docButton: {
    background: "none",
    border: "none",
    padding: 0,
    marginTop: "6px",
    color: "#2563eb",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "underline",
  },
  inputBox: {
    display: "flex",
    gap: "6px",
    padding: "10px",
    borderTop: "1px solid #ccc",
  },
  input: {
    flex: 1,
  },
};
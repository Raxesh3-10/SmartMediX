import { useEffect, useRef, useState } from "react";
import { ChatAPI, ChatFileAPI } from "../api/api";
import { encryptMessage, decryptMessage } from "../utils/chatCrypto";

export default function DoctorChatBox({ user, patientUser,doctor, patient }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ================= LOAD CHAT ================= */

  useEffect(() => {
    if (doctor && patient) loadChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.doctorId, patient?.patientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    const res = await ChatAPI.getChatHistory(
      doctor.doctorId,
      patient.patientId
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

    setMessages(decrypted);
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
            doctor.doctorId
          );
        } else if (file.type === "application/pdf") {
          res = await ChatFileAPI.uploadDocument(
            file,
            doctor.doctorId
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
        senderRole: "DOCTOR",
        senderId: doctor.doctorId,
        message: encrypted,
        fileUrls,
      });

      setText("");
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadChat();
    } finally {
      setUploading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <strong>{patientUser?.name || "Patient"}</strong>
          <div style={styles.sub}>
            {patientUser?.email || ""}
          </div>
        </div>
        <div style={styles.me}>
          {user?.name}
          <div style={styles.sub}>{user?.email}</div>
        </div>
      </div>

      {/* CHAT */}
      <div style={styles.chat}>
        {messages.map((m) => (
          <div
            key={m.messageId}
            style={{
              ...styles.msg,
              alignSelf:
                m.senderRole === "DOCTOR"
                  ? "flex-end"
                  : "flex-start",
              background:
                m.senderRole === "DOCTOR"
                  ? "#dcf8c6"
                  : "#ffffff",
            }}
          >
            {m.message && <div>{m.message}</div>}

            {m.fileUrls?.map((url, i) => (
              <div key={i} style={{ marginTop: 6 }}>
                {url.includes("/images/") ? (
                  <img
                    src={url}
                    alt="attachment"
                    style={styles.image}
                    onClick={() =>
                      window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  />
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 Open PDF
                  </a>
                )}
              </div>
            ))}

            <div style={styles.time}>
              {new Date(m.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          style={styles.input}
        />
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) =>
            setSelectedFiles([...e.target.files])
          }
        />
        <button
          onClick={sendMessage}
          disabled={uploading}
          style={styles.sendBtn}
        >
          {uploading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

/* ================= GREEN WHATSAPP STYLES ================= */

const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#e5ddd5",
  },
  header: {
    background: "#075e54",
    color: "#fff",
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  sub: { fontSize: 12, opacity: 0.8 },
  me: { textAlign: "right" },
  chat: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  msg: {
    maxWidth: "70%",
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
  },
  image: {
    maxWidth: 200,
    borderRadius: 6,
    cursor: "pointer",
  },
  time: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
    color: "#555",
  },
  inputBar: {
    display: "flex",
    gap: 6,
    padding: 10,
    background: "#f0f0f0",
  },
  input: { flex: 1, padding: 6 },
  sendBtn: {
    background: "#25d366",
    border: "none",
    color: "#fff",
    padding: "0 14px",
    cursor: "pointer",
  },
};
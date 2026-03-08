import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppointmentAPI } from "../api/api";
import { ChatFileAPI } from "../api/api";
import { MedicalRecordsAPI } from "../api/api";
import "../styles/components/Chatbot.css";

const WORKER_URL = "https://smartmedix.robin241205.workers.dev/";

const ChatbotAssistant = () => {
  const { user, patient: initialPatient } = useOutletContext();
  const [patient] = useState(initialPatient);

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm mediX. How i help you ?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await AppointmentAPI.getDoctorForAIBot();
        setDoctors(response.data || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Hi! I'm mediX. How i help you ?",
        sender: "bot"
      }
    ]);

    setInput("");
    setSelectedImage(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsTyping(true);
      const res = await ChatFileAPI.uploadImage(file, "AI_CHAT");
      const imageUrl = res.data;
      if (!imageUrl) throw new Error("Image URL not returned from backend");
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage = {
      id: Date.now(),
      text: input || "Please analyze this image.",
      sender: "user",
      image: selectedImage
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {

      const specialties = [...new Set(doctors.map(d => d.doctor.specialization))].join(", ");

      const apiMessages = updatedMessages.map(msg => {

        if (msg.sender === "user" && msg.image) {
          return {
            role: "user",
            content: [
              { type: "text", text: msg.text },
              { type: "image_url", image_url: { url: msg.image } }
            ]
          };
        }

        return {
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        };

      });

      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-vl-235b-a22b-thinking",
          specialties: specialties,
          patientId: patient?.patientId || null,
          messages: apiMessages
        })
      });

      if (response.status === 429) throw new Error("RATE_LIMIT");
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let botContent = "";
      const streamedMessageId = Date.now() + 1;

      setMessages(prev => [
        ...prev,
        { id: streamedMessageId, text: "", sender: "bot" }
      ]);

      while (true) {

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split("\n").filter(l => l.startsWith("data:"));

        for (let line of lines) {

          const jsonStr = line.replace("data: ", "").trim();

          if (jsonStr === "[DONE]") continue;

          try {

            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {

              botContent += content;

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === streamedMessageId
                    ? { ...msg, text: botContent }
                    : msg
                )
              );

            }

          } catch (err) {
            console.error("Streaming parse error:", err);
          }

        }

      }

      if (botContent.includes("###REDIRECT###")) {

        const blockMatch = botContent.match(/###REDIRECT###([\s\S]*?)###END###/);

        if (blockMatch) {

          const block = blockMatch[1];

          const specialtyMatch = block.match(/SPECIALIZATION:\s*(.*)/);
          const diagnosisMatch = block.match(/DIAGNOSIS:\s*(.*)/);
          const prescriptionMatch = block.match(/PRESCRIPTION:\s*([\s\S]*?)(?=###|$)/);

          const specialty = specialtyMatch?.[1]?.trim();
          const diagnosis = diagnosisMatch?.[1]?.trim() || "AI Booking";
          const prescription = prescriptionMatch?.[1]?.trim() || "";

          const cleanText = botContent.replace(/###REDIRECT###[\s\S]*?###END###/, "").trim();

          setMessages(prev =>
            prev.map(msg =>
              msg.id === streamedMessageId
                ? { ...msg, text: cleanText }
                : msg
            )
          );

          if (diagnosis && patient?.patientId) {

            try {

              await MedicalRecordsAPI.generateReport({
                patientId: patient.patientId,
                diagnosis: `AI PRELIMINARY: ${diagnosis}`,
                prescription: prescription || "Pending doctor consultation",
                fileUrls: selectedImage ? [selectedImage] : []
              });

            } catch (err) {
              console.error("Failed to save pre-booking medical record:", err);
            }

          }

          setTimeout(() => {

            setIsOpen(false);
            resetChat();

            navigate("/patient/booking", {
              state: {
                filterSpecialty: specialty,
                aiDiagnosis: diagnosis,
                aiPrescription: prescription,
                fileUrls: selectedImage ? [selectedImage] : [],
                adviceOnly: false
              }
            });

          }, 2000);

        }

      } else {

        try {

          const recordMatch = botContent.match(/###MEDICAL_RECORD###([\s\S]*?)###END###/);

          if (recordMatch) {

            const block = recordMatch[1];

            const diagnosisMatch = block.match(/DIAGNOSIS:\s*(.*)/);
            const prescriptionMatch = block.match(/PRESCRIPTION:\s*([\s\S]*)/);

            const diagnosis = diagnosisMatch?.[1]?.trim();
            const prescription = prescriptionMatch?.[1]?.trim();

            if (diagnosis && prescription && patient?.patientId) {

              await MedicalRecordsAPI.generateReport({
                patientId: patient.patientId,
                diagnosis,
                prescription,
                fileUrls: selectedImage ? [selectedImage] : []
              });

            }

          }

        } catch (err) {
          console.error("Failed to save AI advice record:", err);
        }

      }

    } catch (error) {

      console.error("mediX Error:", error);

      let errorMessage = "I'm having trouble connecting to the server. Please try again.";

      if (error.message === "RATE_LIMIT") {
        errorMessage = "Too many requests right now. Please wait a moment and try again.";
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: errorMessage, sender: "bot" }
      ]);

    } finally {
      setSelectedImage(null);
      setIsTyping(false);
    }

  };

  return (
    <div className="chatbot-container">

      <div className={`chat-window ${isOpen ? "open" : ""}`}>

        <div className="chat-header">
          <div className="header-title"><span>⚡</span> mediX AI</div>
          <button 
            className="close-btn" 
            onClick={() => {
              setIsOpen(false);
              resetChat();
            }}
          >
            ×
          </button>
        </div>

        <div className="chat-body">

          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="bubble">

                {msg.text}

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    style={{ maxWidth: "150px", marginTop: "8px", borderRadius: "8px" }}
                  />
                )}

              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />

        </div>

        <div className="chat-footer">

          <label style={{ cursor: "pointer", marginRight: "8px" }}>
            📷
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>

          <input
            type="text"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
          >
            ➤
          </button>

        </div>

      </div>

      <button
        className={`chatbot-toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "▼" : "⚡"}
      </button>

    </div>
  );
};

export default ChatbotAssistant;
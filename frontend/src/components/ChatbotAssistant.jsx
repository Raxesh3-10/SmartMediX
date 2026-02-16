import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppointmentAPI } from "../api/api";
import { ChatFileAPI } from "../api/api";
import { MedicalRecordsAPI } from "../api/api";
import "../styles/components/Chatbot.css";

const OPENROUTER_API_KEY = "";

const ChatbotAssistant = () => {
  const { user, patient: initialPatient } = useOutletContext();
  const [patient] = useState(initialPatient);

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm mediX. Would you like medical advice or book an appointment?", sender: "bot" }
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
          content: msg.text,
        };
      });

      /* ================= ORIGINAL SYSTEM PROMPT (UNCHANGED) ================= */

      const systemMsg = {
        role: "system",
        content: `
You are mediX, a professional and empathetic medical doctor assistant.

Behavior:
- Act like a real licensed physician.
- Be calm, professional, and medically responsible.
- Do not use markdown formatting.

CRITICAL RULES:

1) You must FIRST ask:
   "Would you like medical advice or book an appointment?"

   Do NOT provide diagnosis, prescription, or redirect before the user clearly answers.

2) Only generate a medical record block if ALL of the following are true:
   - The user explicitly selects medical advice.
   - The user provides actual symptom details.
   - There is enough clinical information to form a reasonable preliminary assessment.

3) NEVER generate a medical record block for:
   - Greetings
   - General health questions without symptoms
   - Lifestyle tips
   - Preventive advice without complaint
   - Vague messages
   - Missing clinical details
   - If patientId is null or unavailable
   - If diagnosis would be generic

4) If symptoms are insufficient:
   - Ask follow-up clinical questions.
   - Do NOT generate MEDICAL_RECORD block.

5) If sufficient clinical data exists:
   - Provide clear medical advice.
   - At the END append EXACTLY:

###MEDICAL_RECORD###
DIAGNOSIS: <specific short clinical summary>
PRESCRIPTION: <clear practical treatment plan>
###END###

6) If user selects appointment:
   - Match best Specialization from: [${specialties}]
   - Generate 1 sentence clinical summary.
   - Response MUST start with EXACTLY:
###REDIRECT###
SPECIALIZATION: <SPECIALIZATION>
DIAGNOSIS: <short clinical summary>
PRESCRIPTION: <clear practical treatment plan>
###END###

`
      };

      /* ================= STREAMING CALL ================= */

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "mediX AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-vl-235b-a22b-thinking",
          stream: true,
          messages: [systemMsg, ...apiMessages],
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

      /* ================= ORIGINAL REDIRECT + RECORD LOGIC ================= */

      if (botContent.includes("###REDIRECT:")) {

        const match = botContent.match(/###REDIRECT:\s*(.*?)###/);
        let specialty = "";
        let diagnosis = "Self-booked via AI";

        if (match) {
          const parts = match[1].split("|");
          specialty = parts[0].trim();
          if (parts.length > 1) diagnosis = parts[1].trim();
        }

        const cleanText = botContent.replace(/###REDIRECT:.*?###/, "").trim();

        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamedMessageId
              ? { ...msg, text: cleanText }
              : msg
          )
        );

        setTimeout(() => {
          setIsOpen(false);
          navigate("/patient/booking", {
            state: {
              filterSpecialty: specialty,
              aiDiagnosis: diagnosis
            }
          });
        }, 2000);

      } else {

        try {
          const recordMatch = botContent.match(/###MEDICAL_RECORD###([\s\S]*?)###END###/);

          if (recordMatch) {
            const block = recordMatch[1];

            const diagnosisMatch = block.match(/DIAGNOSIS:\s*(.*)/);
            const prescriptionMatch = block.match(/PRESCRIPTION:\s*([\s\S]*)/);

            const diagnosis = diagnosisMatch?.[1]?.trim();
            const prescription = prescriptionMatch?.[1]?.trim();

            if (diagnosis && prescription) {
              await MedicalRecordsAPI.generateReport({
                patientId: patient?.patientId,
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
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
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
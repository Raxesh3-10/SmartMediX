import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { AppointmentAPI } from "../api/api";
import "../styles/components/Chatbot.css";

const OPENROUTER_API_KEY = YOUR_API_KEY;

const ChatbotAssistant = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm mediX. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // 1. Get list of specializations
      const specialties = [...new Set(doctors.map(d => d.doctor.specialization))].join(", ");

      const apiMessages = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // 2. Updated System Prompt to include Diagnosis Summary
      const systemMsg = {
        role: "system",
        content: `
          You are mediX, a medical assistant.
          
          Instructions:
          1. First, interpret if the user wants to book an appointment or just advice.
          2. IF NO APPOINTMENT NEEDED: Give simple, plain text health advice.
          3. IF USER WANTS APPOINTMENT (or agrees to one):
             - Analyze the symptoms.
             - Match to the best Specialization from: [${specialties}].
             - Generate a 1-sentence concise professional diagnosis/summary (e.g., "Patient reports migraine symptoms and light sensitivity").
             - Your response MUST start with this EXACT format:
               "###REDIRECT: <SPECIALIZATION> | <DIAGNOSIS_SUMMARY>###"
             - Example: "###REDIRECT: Dermatologist | Patient reports itchy rash on left arm, potential allergic reaction.###"
             - After the tag, add a short polite closing message for the user.
          4. Keep responses short. No markdown.
        `
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [systemMsg, ...apiMessages],
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      const botContent = result.choices[0].message.content;

      // 3. Intercept the Redirect Command
      if (botContent.includes("###REDIRECT:")) {
        const match = botContent.match(/###REDIRECT:\s*(.*?)###/);
        
        let specialty = "";
        let diagnosis = "Self-booked via AI";

        if (match) {
            // Split "Dermatologist | Itchy rash..." into two parts
            const parts = match[1].split("|");
            specialty = parts[0].trim();
            if (parts.length > 1) diagnosis = parts[1].trim();
        }
        
        // Remove the command tag so the user sees a clean message
        const cleanText = botContent.replace(/###REDIRECT:.*?###/, "").trim();

        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: cleanText || `I've analyzed your symptoms. Connecting you to a ${specialty}...`, 
          sender: "bot" 
        }]);

        // 4. Perform Navigation with Diagnosis
        setTimeout(() => {
            setIsOpen(false);
            // Navigate to Booking Page with BOTH Specialty and AI Diagnosis
            navigate("/patient/booking", { 
                state: { 
                    filterSpecialty: specialty,
                    aiDiagnosis: diagnosis 
                } 
            });
        }, 2000);

      } else {
        // Normal text response
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: botContent.replace(/[*#_~]/g, ''), 
          sender: "bot"
        }]);
      }

    } catch (error) {
      console.error("mediX Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I'm having trouble connecting to the server. Please try again.", 
        sender: "bot" 
      }]);
    } finally {
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
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <div className="bubble typing"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping}>➤</button>
        </div>
      </div>

      <button className={`chatbot-toggle ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "▼" : "⚡"}
      </button>
    </div>
  );
};

export default ChatbotAssistant;
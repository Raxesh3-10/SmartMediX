import { useState, useRef, useEffect } from "react";
import { AppointmentAPI } from "../api/api";
import "../styles/components/Chatbot.css";

const OPENROUTER_API_KEY = "YOUR_API_KEY";

const ChatbotAssistant = () => {
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
      const doctorContext = doctors.length > 0 
        ? doctors.map(d => `${d.user.name} (${d.doctor.specialization})`).join(", ")
        : "No doctors currently available";

      const apiMessages = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
        // We keep this here so the AI remains smart in the next turn
        ...(msg.reasoning_details && { reasoning_details: msg.reasoning_details })
      }));

      const systemMsg = {
        role: "system",
        content: `You are mediX. Instructions: 1. Plain text only. 2. Suggest doctors from: [${doctorContext}]. 3. No markdown.`
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
          reasoning: { enabled: true }
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      const botMessage = result.choices[0].message;

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: botMessage.content.replace(/[*#_~]/g, ''), 
        sender: "bot",
        reasoning_details: botMessage.reasoning_details 
      }]);

    } catch (error) {
      console.error("mediX Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I'm having a moment. Could you try that again?", 
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
            placeholder="Ask mediX..."
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
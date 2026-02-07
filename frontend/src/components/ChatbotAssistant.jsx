import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai"; // Using your specific library
import { AppointmentAPI } from "../api/api"; // use getDoctorForAIBot
import "../styles/components/Chatbot.css";

// Initialize with your API Key
const ai = new GoogleGenAI({ apiKey: "AIzaSyB13GYgF-wu40dEyTu07NgUg7JzFKhhuKs" });

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm mediX, your Health AI Assistant. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // ... (keep your imports the same)

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // STRICT SYSTEM PROMPT
      const systemPrompt = "You are mediX. Instructions: 1. Give very short, necessary answers only. 2. No long paragraphs. 3. Use plain text only. 4. Do NOT use markdown like **bold**, ## headers, or bullet symbols like *. 5. For advice, use simple numbers (1. 2. 3.). 6. Use friendly emojis. 7. If urgent, say: Please see a doctor immediately.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${systemPrompt} \n\n Patient: ${input}`,
      });

      // Clean the text to ensure no Markdown symbols (* or #) sneak in
      let botText = response.text.replace(/[*#_~]/g, '');

      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: botText, 
        sender: "bot" 
      }]);
    } catch (error) {
      console.error("mediX Error:", error);
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: "I'm a bit dizzy 😵. Can you ask that again?", 
        sender: "bot" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-container">
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="header-title">
            <span>⚡</span> mediX AI
          </div>
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
              <div className="bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Ask mediX about health..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping}>
            ➤
          </button>
        </div>
      </div>

      <button 
        className={`chatbot-toggle ${isOpen ? "active" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <span className="icon-close">▼</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-lightning">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatbotAssistant;
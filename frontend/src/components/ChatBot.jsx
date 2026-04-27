import { useState, useRef, useEffect } from "react";

const botReplies = {
  hello: "Hello 👋 How can I help you today?",
  hi: "Hey there! 👋 What can I assist you with?",
  event: "You can join events from the Events section after login. Browse available opportunities and send join requests!",
  document: "Upload your ID document in Profile → Document Upload. Supported formats: PDF, JPG, PNG.",
  certificate: "Certificates are available after event completion. Check the Certificates section in your dashboard!",
  verify: "Admin verifies your account within 24 hours. You'll receive an email notification once approved.",
  help: "I can help you with: events, documents, certificates, verification, and general queries. Just ask!",
  volunteer: "As a volunteer, you can join events, track participation, earn certificates, and make a difference!",
  organizer: "Organizers can create events, manage volunteers, track attendance, and generate reports.",
  default: "Sorry 😅 I didn't understand. Try asking about events, documents, certificates, or verification."
};

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 I'm your VolunteerHub assistant! How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const key = Object.keys(botReplies).find(k =>
      input.toLowerCase().includes(k)
    );

    const botMsg = {
      sender: "bot",
      text: botReplies[key] || botReplies.default
    };

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 800);

    setInput("");
  };

  const handleQuickReply = (q) => {
    const userMsg = { sender: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    const key = Object.keys(botReplies).find(k =>
      q.toLowerCase().includes(k)
    );
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "bot", text: botReplies[key] || botReplies.default }]);
    }, 800);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-500 transform hover:scale-110 ${
          open
            ? "bg-gradient-to-br from-red-500 to-pink-600 rotate-90 shadow-red-500/40"
            : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 animate-bounce shadow-purple-500/50"
        }`}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">VolunteerBot</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto">
            {["Events", "Certificate", "Help"].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickReply(q)}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold transition-all ${
                  input.trim()
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;

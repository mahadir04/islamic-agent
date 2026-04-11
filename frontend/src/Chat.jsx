import { useState, useRef, useEffect } from "react";
import { askQuestion, getSession } from "./api";

export default function Chat({ isDarkMode, sessionId, onSessionUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId);
    }
  }, [sessionId]);

  const loadSessionMessages = async (sid) => {
    setLoadingSession(true);
    try {
      const session = await getSession(sid);
      if (session && session.messages && session.messages.length > 0) {
        setMessages(session.messages);
      } else {
        setMessages([
          { 
            role: "bot", 
            content: "As-salamu alaykum! I'm your Islamic AI assistant. I can answer questions based on Quran, Hadith, and authentic Islamic sources. How can I help you today?" 
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading session:", error);
      setMessages([
        { 
          role: "bot", 
          content: "As-salamu alaykum! I'm your Islamic AI assistant. How can I help you today?" 
        }
      ]);
    } finally {
      setLoadingSession(false);
    }
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;
    
    const userMessage = messageText.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const response = await askQuestion(userMessage, sessionId);
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: response.answer,
        timestamp: new Date().toISOString()
      }]);
      
      if (onSessionUpdate) {
        onSessionUpdate();
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "I apologize, but I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What are the five pillars of Islam?",
    "How to perform wudu?",
    "Zakat calculation rules",
    "Hanafi ruling on music"
  ];

  if (loadingSession) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? 'border-green-400' : 'border-green-600'
          }`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar relative mx-auto w-full max-w-5xl ${
        isDarkMode ? 'bg-[#0f0f11]' : 'bg-transparent'
      }`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                message.role === "user" 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {message.role === "user" ? "You" : "AI"}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-3xl px-5 py-3.5 max-w-full animate-fade-in ${
                message.role === "user"
                  ? isDarkMode
                    ? 'bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-br-sm'
                    : 'bg-[#101010] text-gray-100 shadow-sm rounded-br-sm'
                  : isDarkMode
                    ? 'bg-[#0f0f11] text-gray-300 border border-white/5 rounded-bl-sm'
                    : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-sm'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {message.content}
                </div>
                {message.timestamp && (
                  <div className={`text-xs mt-2 ${
                    message.role === "user" 
                      ? 'text-blue-100' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                AI
              </div>
              <div className={`rounded-3xl px-5 py-4 animate-fade-in ${
                isDarkMode
                  ? 'bg-transparent text-gray-400 border border-white/5 rounded-bl-sm'
                  : 'bg-white text-gray-500 border border-gray-100 shadow-sm rounded-bl-sm'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-green-600'} font-medium`}>
                    Searching Islamic sources...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className={`px-6 py-4 flex flex-col items-center justify-center`}>
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className={`px-4 py-2 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-white/5 hover:border-white/20'
                    : 'bg-white text-gray-600 shadow-sm hover:shadow border border-gray-100 hover:border-gray-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-4 md:p-6 w-full max-w-4xl mx-auto backdrop-blur-md sticky bottom-0 z-10">
        <div className={`flex items-end space-x-2 rounded-[2rem] p-2 shadow-sm transition-all duration-300 ${
          isDarkMode ? 'bg-[#1a1a1a]/80 border border-white/10 focus-within:border-white/20' : 'bg-white border border-gray-200 focus-within:border-gray-300'
        }`}>
          <div className="flex-1 relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className={`w-full bg-transparent border-none py-3 pl-4 pr-10 resize-none focus:outline-none max-h-32 text-[15px] custom-scrollbar ${
                isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
              }`}
              rows="1"
              disabled={loading}
              style={{ minHeight: '48px' }}
            />
            <div className={`absolute right-3 text-xs opacity-0 md:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
              ↵
            </div>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
              loading || !input.trim()
                ? isDarkMode ? 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : isDarkMode ? 'bg-white text-black hover:scale-105' : 'bg-[#101010] text-white shadow-xl shadow-black/10 hover:scale-105'
            }`}
          >
            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
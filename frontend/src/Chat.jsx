import { useState, useRef, useEffect } from "react";
import { askQuestion } from "./api";

export default function Chat({ isDarkMode, isMobile }) {
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: "As-salamu alaykum! I'm your Islamic AI assistant. I can answer questions based on Quran, Hadith, and authentic Islamic sources. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(!isMobile);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setShowSuggestions(false);

    try {
      const answer = await askQuestion(userMessage);
      setMessages(prev => [...prev, { role: "bot", content: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "As-salamu alaykum. I apologize, but I'm having trouble connecting. Please try again later." 
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

  const clearChat = () => {
    setMessages([
      { 
        role: "bot", 
        content: "As-salamu alaykum! The conversation has been cleared. How can I assist you with Islamic knowledge today?" 
      }
    ]);
    setShowSuggestions(true);
  };

  const quickQuestions = [
    { text: "Five pillars of Islam", icon: "🕌" },
    { text: "How to pray", icon: "🕋" },
    { text: "Zakat calculator", icon: "💰" },
    { text: "Fasting rules", icon: "🌙" },
    { text: "Halal food", icon: "🥘" },
    { text: "Islamic marriage", icon: "💑" }
  ];

  const suggestionQuestions = [
    "What are the five pillars of Islam?",
    "How to perform wudu?",
    "Zakat calculation rules",
    "Hanafi ruling on music",
    "Islamic view on charity",
    "Prophet Muhammad's biography"
  ];

  return (
    <div className={`flex flex-col ${isMobile ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
      
      {/* Chat Header */}
      <div className={`flex-shrink-0 px-3 py-3 md:px-4 md:py-4 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
              loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
            }`}></div>
            <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {loading ? 'Searching...' : 'Online'}
            </span>
          </div>
          <button
            onClick={clearChat}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-6 custom-scrollbar ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slideIn`}
          >
            <div className={`flex max-w-[90%] md:max-w-[85%] ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            } items-start space-x-2 md:space-x-3`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-white text-xs md:text-sm font-bold ${
                message.role === "user" 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {message.role === "user" ? "You" : "AI"}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-xl md:rounded-2xl p-2.5 md:p-4 shadow-sm text-sm md:text-base ${
                message.role === "user"
                  ? isDarkMode
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-none'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-none'
                    : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-green-100 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
                <div className={`text-[10px] md:text-xs mt-1.5 md:mt-2 ${
                  message.role === "user" 
                    ? 'text-blue-100' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-start space-x-2 md:space-x-3 max-w-[90%] md:max-w-[85%]">
              <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                AI
              </div>
              <div className={`rounded-xl md:rounded-2xl p-3 md:p-4 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 rounded-tl-none'
                  : 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-tl-none'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>
                    Searching...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Action Buttons (Mobile) */}
      {isMobile && messages.length === 1 && showSuggestions && (
        <div className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="grid grid-cols-3 gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q.text)}
                className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-lg mb-1">{q.icon}</span>
                <span className="text-[10px] text-center">{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className={`flex-shrink-0 p-3 md:p-6 border-t ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-2 md:space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMobile ? "Ask..." : "Ask your question about Islam..."}
                className={`w-full border rounded-xl md:rounded-2xl p-2.5 md:p-4 pr-12 resize-none focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-green-500'
                }`}
                rows={isMobile ? 2 : 3}
                disabled={loading}
              />
              {!isMobile && (
                <div className="absolute right-3 bottom-3 text-gray-400 text-xs">
                  ↵ Enter
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-medium transition-all flex items-center justify-center ${
                loading || !input.trim()
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-200 text-gray-400'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Desktop Suggestions */}
          {!isMobile && messages.length === 1 && showSuggestions && (
            <div className="flex flex-wrap gap-2">
              {suggestionQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
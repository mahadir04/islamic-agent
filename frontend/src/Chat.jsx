import { useState, useRef, useEffect } from "react";
import { askQuestion } from "./api";

export default function Chat({ isDarkMode }) {
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: "As-salamu alaykum! I'm your Islamic AI assistant. I can answer questions based on Quran, Hadith, and authentic Islamic sources. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const answer = await askQuestion(userMessage);
      setMessages(prev => [...prev, { role: "bot", content: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "As-salamu alaykum. I apologize, but I'm having trouble connecting to the knowledge base. Please try again later or consult with a local scholar." 
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
  };

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Chat Header */}
      <div className={`border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'
      } p-4 flex justify-between items-center`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {loading ? 'Searching Islamic sources...' : 'Online'}
          </span>
        </div>
        <button
          onClick={clearChat}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
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
              <div className={`rounded-2xl p-4 shadow-sm ${
                message.role === "user"
                  ? isDarkMode
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none'
                    : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-green-100 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === "user" 
                    ? 'text-blue-100' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {message.role === "user" ? 'You' : 'Islamic AI Assistant'}
                </div>
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
              <div className={`rounded-2xl p-4 shadow-sm ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none'
                  : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-green-100 rounded-bl-none'
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
      
      {/* Input Area */}
      <div className={`border-t p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your question about Islam (prayer, fasting, zakat, fiqh rulings, etc.)..."
              className={`w-full border rounded-2xl p-4 pr-12 resize-none focus:outline-none focus:ring-2 transition-all duration-200 custom-scrollbar ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-green-500 focus:border-green-500'
              }`}
              rows="3"
              disabled={loading}
            />
            <div className="absolute right-3 bottom-3 text-gray-400 text-sm">
              ↵ Enter to send
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`self-end px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 ${
              loading || !input.trim()
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            <span>Send</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "What are the five pillars of Islam?",
            "How to perform wudu?",
            "Zakat calculation rules",
            "Hanafi ruling on music"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
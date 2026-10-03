import { useState, useRef, useEffect } from "react";
import { askQuestion, getSession } from "./api";

// ── Markdown-like renderer for bot messages ────────────────
function BotContent({ content }) {
  // Very lightweight inline rendering (bold, blockquotes, lists)
  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="my-1.5 space-y-0.5 pl-4">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const renderInline = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(i); elements.push(<div key={i} className="h-1" />); return; }

    if (trimmed.startsWith('### ')) {
      flushList(i);
      elements.push(<h3 key={i} className="font-semibold text-emerald-400 mt-3 mb-1 text-sm">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith('## ')) {
      flushList(i);
      elements.push(<h2 key={i} className="font-bold text-emerald-300 mt-4 mb-1 text-base">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith('> ')) {
      flushList(i);
      elements.push(
        <blockquote key={i} className="border-l-2 border-emerald-500 pl-3 my-2 italic opacity-80 text-sm">
          <span dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />
        </blockquote>
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList(i);
      elements.push(
        <p key={i} className="leading-relaxed my-0.5"
          dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />
      );
    }
  });
  flushList('end');

  return <div className="chat-content text-[14.5px]">{elements}</div>;
}

// ── Chat component ─────────────────────────────────────────
export default function Chat({ isDarkMode, sessionId, onSessionUpdate }) {
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (sessionId) loadSessionMessages(sessionId);
  }, [sessionId]);

  const loadSessionMessages = async (sid) => {
    setLoadingSession(true);
    try {
      const session = await getSession(sid);
      if (session?.messages?.length > 0) {
        setMessages(session.messages);
      } else {
        setMessages([{
          role: "bot",
          content: "As-salamu alaykum wa rahmatullahi wa barakatuh! 🌙\n\nI'm your Islamic AI assistant — here to help with questions about the Quran, Hadith, Fiqh, Seerah, and more.\n\nHow can I serve you today?",
        }]);
      }
    } catch {
      setMessages([{
        role: "bot",
        content: "As-salamu alaykum! I'm your Islamic AI assistant. How can I help you today?",
      }]);
    } finally {
      setLoadingSession(false);
    }
  };

  const sendMessage = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const response = await askQuestion(text, sessionId);
      setMessages(prev => [...prev, {
        role: "bot",
        content: response.answer,
        timestamp: new Date().toISOString(),
      }]);
      if (onSessionUpdate) onSessionUpdate();
    } catch {
      setMessages(prev => [...prev, {
        role: "bot",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const quickQuestions = [
    { icon: "📖", text: "What are the five pillars of Islam?" },
    { icon: "🤲", text: "How to perform wudu correctly?" },
    { icon: "💰", text: "How is Zakat calculated?" },
    { icon: "🌙", text: "Virtues of fasting in Ramadan" },
  ];

  // Loading skeleton
  if (loadingSession) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${
        isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 flex items-center justify-center animate-float">
          <span className="text-2xl">🕌</span>
        </div>
        <div className="flex space-x-1.5">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Loading conversation…
        </p>
      </div>
    );
  }

  const isFirstMessage = messages.length <= 1;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'}`}>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex items-end gap-3 msg-bubble ${isUser ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Bot avatar */}
                {!isUser && (
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm
                    ${isDarkMode
                      ? 'bg-gradient-to-br from-emerald-600/30 to-green-700/20 border border-emerald-500/20 text-emerald-300'
                      : 'bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/60 text-emerald-700'
                    }
                  `}>
                    🕌
                  </div>
                )}

                {/* Bubble */}
                <div className={`
                  max-w-[82%] rounded-2xl px-4 py-3
                  ${isUser
                    ? isDarkMode
                      ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-br-sm shadow-lg shadow-emerald-900/30'
                      : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-sm shadow-md shadow-emerald-300/30'
                    : isDarkMode
                      ? 'bg-[#15151c] border border-white/[0.07] text-gray-200 rounded-bl-sm'
                      : 'bg-white border border-gray-100/80 text-gray-800 rounded-bl-sm shadow-sm'
                  }
                `}>
                  {isUser
                    ? <p className="text-[14.5px] leading-relaxed">{message.content}</p>
                    : <BotContent content={message.content} />
                  }

                  {message.timestamp && (
                    <p className={`text-[11px] mt-1.5 ${
                      isUser
                        ? 'text-white/60'
                        : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {/* User avatar */}
                {isUser && (
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold
                    ${isDarkMode
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10 text-gray-200'
                      : 'bg-gradient-to-br from-slate-600 to-slate-800 text-white'
                    }
                  `}>
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-3 justify-start msg-bubble">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm
                ${isDarkMode
                  ? 'bg-gradient-to-br from-emerald-600/30 to-green-700/20 border border-emerald-500/20 text-emerald-300'
                  : 'bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/60 text-emerald-700'
                }
              `}>
                🕌
              </div>
              <div className={`
                rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-3
                ${isDarkMode
                  ? 'bg-[#15151c] border border-white/[0.07]'
                  : 'bg-white border border-gray-100/80 shadow-sm'
                }
              `}>
                <div className="flex space-x-1.5">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Searching Islamic sources…
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Quick questions (shown only on first message) ── */}
      {isFirstMessage && !loading && (
        <div className="px-4 pb-3 flex flex-col items-center animate-slide-up">
          <p className={`text-xs mb-3 font-medium tracking-wide uppercase ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`}>Suggested questions</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                className={`
                  quick-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
                  border transition-all duration-200
                  ${isDarkMode
                    ? 'bg-[#15151c] border-white/[0.07] text-gray-300 hover:border-emerald-500/30 hover:text-emerald-300'
                    : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200 hover:text-emerald-700 shadow-sm'
                  }
                `}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span>{q.icon}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className={`
        px-4 pb-4 pt-2 flex-shrink-0
        ${isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'}
      `}>
        <div className="max-w-3xl mx-auto">
          <div className={`
            input-area flex items-end gap-2 rounded-2xl p-2
            border transition-all duration-200
            ${isDarkMode
              ? 'bg-[#15151c] border-white/[0.07] focus-within:border-emerald-500/30'
              : 'bg-white border-gray-200/80 focus-within:border-emerald-300 shadow-sm'
            }
          `}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about Islam…"
              disabled={loading}
              rows={1}
              className={`
                flex-1 bg-transparent resize-none border-none outline-none
                text-[14.5px] leading-relaxed px-3 py-2.5
                ${isDarkMode
                  ? 'text-gray-100 placeholder-gray-600'
                  : 'text-gray-900 placeholder-gray-400'
                }
              `}
              style={{ minHeight: '44px', maxHeight: '160px' }}
            />

            {/* Character hint */}
            {input.length > 0 && (
              <span className={`self-end pb-3 text-[11px] ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                ↵
              </span>
            )}

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-200
                ${loading || !input.trim()
                  ? isDarkMode
                    ? 'bg-white/4 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 hover:scale-105 active:scale-95 shadow-md shadow-emerald-900/30 btn-glow'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <p className={`text-[11px] text-center mt-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`}>
            Answers are AI-generated — always verify with a qualified scholar.
          </p>
        </div>
      </div>
    </div>
  );
}
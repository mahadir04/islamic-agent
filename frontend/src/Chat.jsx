import { useState, useRef, useEffect } from "react";
import { askQuestion, getSession } from "./api";

// ── Classical Manuscript Quranic Quote & Markdown Parser ──
function BotContent({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="my-2 space-y-1.5 pl-2">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
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
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-amber-200/90">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-mono">$1</code>');

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(i);
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Arabic scripture detection or headers
    if (/[\u0600-\u06FF]/.test(trimmed) && trimmed.length < 120 && !trimmed.startsWith('http')) {
      flushList(i);
      elements.push(
        <div key={i} className="my-3 py-2 px-4 rounded-xl bg-emerald-950/20 border border-emerald-500/15 text-right">
          <p className="font-arabic text-xl text-emerald-300 leading-loose" dir="rtl">
            {trimmed}
          </p>
        </div>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList(i);
      elements.push(
        <h3 key={i} className="font-semibold text-emerald-400 mt-3 mb-1 text-sm tracking-wide uppercase flex items-center gap-1.5">
          <span className="w-1 h-3 rounded-full bg-emerald-500" />
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(i);
      elements.push(
        <h2 key={i} className="font-bold text-emerald-300 mt-4 mb-2 text-base flex items-center gap-2">
          <span>✨</span>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      flushList(i);
      elements.push(
        <div key={i} className="manuscript-card rounded-xl p-3 my-2.5 bg-gradient-to-r from-emerald-500/10 via-amber-500/5 to-transparent border-l-2 border-emerald-400">
          <p className="text-[13.5px] italic text-gray-200 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />
        </div>
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList(i);
      elements.push(
        <p key={i} className="leading-relaxed my-1 text-[14.5px] text-gray-200"
          dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />
      );
    }
  });
  flushList('end');

  return <div className="space-y-1">{elements}</div>;
}

// ── Daily Inspiration Ayah Carousel Data ──
const DAILY_INSPIRATIONS = [
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    translation: "And when My servants ask you concerning Me, indeed I am near.",
    surah: "Surah Al-Baqarah 2:186"
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
    surah: "Surah Ash-Sharh 94:5-6"
  },
  {
    arabic: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ",
    translation: "And rely upon the Ever-Living who does not die, and exalt [Allah] with His praise.",
    surah: "Surah Al-Furqan 25:58"
  }
];

export default function Chat({ isDarkMode, sessionId, onSessionUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [dailyIndex, setDailyIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
          content: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nAs-salamu alaykum wa Rahmatullahi wa Barakatuh. Welcome to your personal Islamic sanctuary and knowledge assistant.\n\nAsk any question regarding the Holy Quran, Sunnah, Hadith commentaries, Fiqh rulings across madhahib, or daily life supplications.",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch {
      setMessages([{
        role: "bot",
        content: "As-salamu alaykum. I am ready to assist you with Islamic guidance and references.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoadingSession(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
        content: "I apologize, but I encountered an error connecting to the Islamic Knowledge engine. Please check your connection and try again.",
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
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  };

  const quickPrompts = [
    { title: "Virtues of Tahajjud", desc: "Night prayer blessings & hadith", icon: "✨", prompt: "Explain the importance, method, and virtues of praying Tahajjud according to the Sunnah." },
    { title: "Zakat Calculation", desc: "Nisab rates & eligible assets", icon: "⚖️", prompt: "How do I calculate Zakat on savings and gold today, and what is the current Nisab standard?" },
    { title: "Morning & Evening Adhkar", desc: "Prophetic protective duas", icon: "🤲", prompt: "What are the essential authentic Morning and Evening Adhkar with Arabic text and benefits?" },
    { title: "Tafsir of Ayah al-Kursi", desc: "Deeper spiritual meanings", icon: "📖", prompt: "Provide a detailed tafsir and linguistic breakdown of Ayah al-Kursi (2:255)." }
  ];

  const activeDaily = DAILY_INSPIRATIONS[dailyIndex];

  if (loadingSession) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${
        isDarkMode ? 'bg-[#06090e]' : 'bg-[#f8fafc]'
      }`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-amber-500/10 to-transparent border border-emerald-500/25 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🕌</span>
        </div>
        <p className="text-sm font-medium mt-4 text-emerald-400">Opening sacred sanctuary…</p>
      </div>
    );
  }

  const isFresh = messages.length <= 1;

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-arabesque-dark' : 'bg-arabesque-light'}`}>
      
      {/* ── Top Ribbon: Daily Quranic Inspiration (Card carousel) ── */}
      {isFresh && (
        <div className="pt-4 px-4 max-w-4xl mx-auto w-full">
          <div className={`
            p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
            ${isDarkMode
              ? 'bg-gradient-to-r from-[#0b1219]/90 via-[#0c181f]/80 to-[#0b1219]/90 border-emerald-500/20 text-gray-200 shadow-xl shadow-black/40'
              : 'bg-gradient-to-r from-emerald-50/80 via-white/90 to-amber-50/60 border-emerald-200 text-gray-800 shadow-md'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Daily Ayah of Reflection
              </span>
              <button
                onClick={() => setDailyIndex((dailyIndex + 1) % DAILY_INSPIRATIONS.length)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'border-white/10 hover:border-emerald-500/40 text-gray-400 hover:text-emerald-300'
                    : 'border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600'
                }`}
              >
                Next Ayah →
              </button>
            </div>
            
            <p className="font-arabic text-xl text-right text-emerald-300 leading-relaxed my-2" dir="rtl">
              {activeDaily.arabic}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <p className="italic text-gray-300">{activeDaily.translation}</p>
              <span className="text-amber-400 font-semibold flex-shrink-0">{activeDaily.surah}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 md:gap-4 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md
                    ${isDarkMode
                      ? 'bg-gradient-to-br from-emerald-500/20 to-amber-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                    }
                  `}>
                    <span className="text-base">🕌</span>
                  </div>
                )}

                <div className={`
                  group relative max-w-[85%] md:max-w-[78%] rounded-2xl p-4 md:p-5 transition-all
                  ${isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-sm shadow-lg shadow-emerald-950/40'
                    : isDarkMode
                      ? 'bg-[#0e1622]/90 border border-white/10 rounded-tl-sm text-gray-100 shadow-md backdrop-blur-md'
                      : 'bg-white border border-gray-200/80 rounded-tl-sm text-gray-800 shadow-sm'
                  }
                `}>
                  {/* Action buttons (Copy) */}
                  {!isUser && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                          isDarkMode
                            ? 'bg-black/40 border-white/10 text-gray-300 hover:text-emerald-300 hover:border-emerald-500/30'
                            : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-emerald-700'
                        }`}
                        title="Copy Response"
                      >
                        {copiedIndex === index ? (
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {isUser ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <BotContent content={message.content} />
                  )}

                  {message.timestamp && (
                    <div className={`mt-2 pt-1 border-t text-[11px] flex items-center justify-between ${
                      isUser
                        ? 'border-white/15 text-emerald-100/70'
                        : isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'
                    }`}>
                      <span>{isUser ? 'You' : 'Noor AI Assistant'}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 font-semibold text-xs shadow-md
                    ${isDarkMode
                      ? 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white border border-emerald-400/30'
                      : 'bg-slate-700 text-white'
                    }
                  `}>
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing state */}
          {loading && (
            <div className="flex gap-3 md:gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <span className="text-base">🕌</span>
              </div>
              <div className={`
                p-4 rounded-2xl rounded-tl-sm border flex items-center gap-3
                ${isDarkMode ? 'bg-[#0e1622]/90 border-white/10' : 'bg-white border-gray-200'}
              `}>
                <div className="flex gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span className="text-xs font-medium text-emerald-400 tracking-wide">
                  Consulting authentic hadith & scriptures…
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Suggested Questions Carousel / Grid ── */}
      {isFresh && !loading && (
        <div className="px-4 pb-2 max-w-4xl mx-auto w-full">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span>⚡</span> Suggested Explorations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className={`
                  p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-200
                  ${isDarkMode
                    ? 'bg-[#0b1219]/80 border-white/10 hover:border-emerald-500/40 hover:bg-[#101923] text-gray-200'
                    : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-800 shadow-sm'
                  }
                `}
              >
                <span className="text-xl p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                  {item.icon}
                </span>
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Modern Central AI Input Dock (Claude / Perplexity style) ── */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full flex-shrink-0">
        <div className={`
          relative rounded-2xl border transition-all duration-300 shadow-2xl
          ${isDarkMode
            ? 'bg-[#0d141f]/95 border-emerald-500/30 focus-within:border-emerald-400 focus-within:shadow-emerald-950/40'
            : 'bg-white border-gray-300 focus-within:border-emerald-500 focus-within:shadow-emerald-200/50'
          }
        `}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask about Quran verses, Hadith rulings, Fiqh, or daily du'a..."
            className={`
              w-full bg-transparent resize-none border-none outline-none px-4 pt-3.5 pb-12
              text-[15px] leading-relaxed
              ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
            `}
            style={{ minHeight: '56px', maxHeight: '180px' }}
          />

          {/* Bottom Dock Control Badges */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-medium ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-emerald-400'
                  : 'bg-gray-100 border-gray-200 text-emerald-700'
              }`}>
                <span>🕌</span> Verified Sources
              </span>
              <span className={`hidden sm:inline text-[11px] px-2 py-0.5 rounded text-gray-500`}>
                Shift+Enter for new line
              </span>
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200
                ${loading || !input.trim()
                  ? isDarkMode
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 hover:scale-105 active:scale-95'
                }
              `}
            >
              <span>Send</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        <p className={`text-[11px] text-center mt-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Noor AI is an educational assistant. For binding fatwas, consult your local certified Islamic scholars.
        </p>
      </div>

    </div>
  );
}
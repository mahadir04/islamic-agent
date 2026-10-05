import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { askQuestion, getSession, getSessions, deleteSession } from "./api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const computeClientTopic = (text = "", userMsgCount = 1) => {
  const q = text.toLowerCase();
  let name = "Spiritual Inquiries & Learning";
  if (/prayer|salah|namaz|rakat|fajr|wudu|taharah|ghusl|sujood/.test(q)) {
    name = "Prayer & Purification (Salah & Taharah)";
  } else if (/fasting|sawm|ramadan|iftar|suhoor|tarawih/.test(q)) {
    name = "Fasting & Ramadan (Sawm)";
  } else if (/zakat|charity|sadaqah|wealth|gold|nisab/.test(q)) {
    name = "Zakat & Ethical Wealth";
  } else if (/hajj|umrah|makkah|kaaba|tawaf|ihram/.test(q)) {
    name = "Hajj & Umrah Pilgrimage";
  } else if (/anxiety|patience|sabr|tawakkul|stress|hardship|peace|grief/.test(q)) {
    name = "Tawakkul (Reliance on Allah)";
  } else if (/marriage|family|parents|children|nikah|divorce|spouse/.test(q)) {
    name = "Family & Social Ethics";
  } else if (/quran|surah|ayah|recitation|tajweed|tafsir/.test(q)) {
    name = "Quranic Sciences & Reflection";
  } else if (/hadith|sunnah|prophet|bukhari|muslim|seerah/.test(q)) {
    name = "Prophetic Sunnah & Seerah";
  } else if (/halal|haram|ruling|permissible|fiqh/.test(q)) {
    name = "Islamic Jurisprudence (Fiqh)";
  } else if (text.trim().length > 0) {
    name = "Quranic Wisdom & Daily Reflection";
  }
  const explored = Math.min(Math.max(1, userMsgCount), 7);
  const percentage = Math.round((explored / 7) * 100);
  return { name, explored, total: 7, percentage };
};

export default function Chat({ isDarkMode, sessionId: propSessionId, onSessionUpdate, user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q');
  const urlSession = searchParams.get('session');
  const urlNew = searchParams.get('new') === '1';

  // Initialize from URL, prop, or localStorage so refreshes always restore the active chat
  const [sessionId, setSessionId] = useState(() => {
    if (urlNew) return null;
    if (urlSession) return urlSession;
    if (propSessionId) return propSessionId;
    return localStorage.getItem('noor_active_session_id') || null;
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(urlQuery || "");
  const [loading, setLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [relatedSources, setRelatedSources] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading]);

  // Sync URL search params and localStorage with active sessionId
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('noor_active_session_id', sessionId);
      const curParam = new URLSearchParams(window.location.search).get('session');
      if (curParam !== sessionId) {
        navigate(`/chat?session=${sessionId}`, { replace: true });
      }
    } else {
      localStorage.removeItem('noor_active_session_id');
      const curParam = new URLSearchParams(window.location.search).get('session');
      if (curParam) {
        navigate('/chat', { replace: true });
      }
    }
  }, [sessionId, navigate]);

  // Respond to browser back/forward and deep link URL param changes
  useEffect(() => {
    if (urlNew) {
      setSessionId(null);
    } else if (urlSession && urlSession !== sessionId) {
      setSessionId(urlSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSession, urlNew]);

  // Load recent sessions — preserving active selection or selecting latest if none active
  const loadRecentSessions = useCallback(async (activeIdToPreserve = null) => {
    try {
      const data = await getSessions();
      setRecentSessions(data || []);
      const currentTarget = activeIdToPreserve || sessionId;
      if (!currentTarget && !urlNew && data && data.length > 0) {
        const savedId = localStorage.getItem('noor_active_session_id');
        const exists = savedId && data.some(s => s.id === savedId);
        const toSelect = exists ? savedId : data[0].id;
        setSessionId(toSelect);
      }
    } catch (e) {
      console.error(e);
    }
  }, [sessionId, urlNew]);

  useEffect(() => {
    loadRecentSessions();
  }, [loadRecentSessions]);

  // Load active session messages and metadata
  useEffect(() => {
    if (sessionId) {
      // Check client-side message cache for instant rendering without flicker
      try {
        const cached = localStorage.getItem(`noor_msgs_${sessionId}`);
        if (cached) {
          const parsedMsgs = JSON.parse(cached);
          if (Array.isArray(parsedMsgs) && parsedMsgs.length > 0) {
            setMessages(parsedMsgs);
          }
        }
      } catch (_) {}

      getSession(sessionId).then(sess => {
        if (sess?.messages) {
          setMessages(sess.messages);
          try {
            localStorage.setItem(`noor_msgs_${sessionId}`, JSON.stringify(sess.messages));
          } catch (_) {}
        } else if (!sess) {
          // If session was deleted on server, reset clean state
          setSessionId(null);
          localStorage.removeItem('noor_active_session_id');
          navigate('/chat', { replace: true });
          return;
        }

        // Topic Progress: load saved topic or compute dynamically from messages
        if (sess?.topic) {
          setCurrentTopic(sess.topic);
        } else if (sess?.messages && sess.messages.length > 0) {
          const userMsgs = sess.messages.filter(m => m.role === 'user');
          const lastMsg = userMsgs[userMsgs.length - 1]?.content || "";
          setCurrentTopic(computeClientTopic(lastMsg, userMsgs.length));
        } else {
          setCurrentTopic(null);
        }

        // Spiritual Context: load saved sources or extract from bot responses
        if (sess?.sources && sess.sources.length > 0) {
          const parsed = sess.sources.slice(0, 4).map((s, idx) => {
            const lines = typeof s === 'string' ? s.split('\n') : [];
            return {
              title: lines[0]?.replace('---', '').trim() || `Reference ${idx + 1}`,
              snippet: lines.slice(1).join(' ').trim().slice(0, 130) + '...'
            };
          });
          setRelatedSources(parsed);
        } else {
          setRelatedSources([]);
        }

        // Suggested Actions: load saved or default
        if (sess?.suggested_actions && sess.suggested_actions.length > 0) {
          setSuggestedActions(sess.suggested_actions);
        }
      }).catch(console.error);
    } else {
      // Clean welcome screen for New Conversation
      setMessages([
        {
          id: 'welcome',
          role: 'bot',
          content: `Assalamu Alaikum, ${user?.name ? user.name.split(' ')[0] : 'seeker'}. How can I assist you on your spiritual journey today? Whether you have questions about the Quran, need guidance on daily practices, or seek a moment of reflection, I am here to help.`
        }
      ]);
      setCurrentTopic(null);
      setRelatedSources([]);
    }
  }, [sessionId, user, navigate]);

  // Handle URL query parameter trigger
  useEffect(() => {
    if (urlQuery && messages.length > 0 && !loading) {
      const timer = setTimeout(() => {
        handleSendMessage(urlQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Modern chat assistant "+ New Conversation" (instant clean slate, no dummy sessions)
  const handleNewConversation = () => {
    setSessionId(null);
    localStorage.removeItem('noor_active_session_id');
    navigate('/chat', { replace: true });
    setRelatedSources([]);
    setCurrentTopic(null);
    setSuggestedActions([]);
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: `Assalamu Alaikum, ${user?.name ? user.name.split(' ')[0] : 'seeker'}. How can I assist you on your spiritual journey today?`
      }
    ]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Permanent Delete Conversation (Optimistic UI + SQLite deletion + cache purge)
  const handleDeleteSession = async (e, idToDelete) => {
    e.stopPropagation();
    if (deleteConfirmId !== idToDelete) {
      setDeleteConfirmId(idToDelete);
      setTimeout(() => {
        setDeleteConfirmId((curr) => (curr === idToDelete ? null : curr));
      }, 4000);
      return;
    }

    setDeletingId(idToDelete);
    setDeleteConfirmId(null);
    try {
      // 1. Optimistically remove from recent sessions list immediately
      setRecentSessions((prev) => prev.filter((s) => s.id !== idToDelete));
      try {
        localStorage.removeItem(`noor_msgs_${idToDelete}`);
      } catch (_) {}

      // 2. If deleting currently active chat, reset to clean new conversation
      if (sessionId === idToDelete) {
        setSessionId(null);
        localStorage.removeItem('noor_active_session_id');
        navigate('/chat', { replace: true });
        setMessages([
          {
            id: 'welcome',
            role: 'bot',
            content: `Assalamu Alaikum, ${user?.name ? user.name.split(' ')[0] : 'seeker'}. How can I assist you on your spiritual journey today?`
          }
        ]);
        setRelatedSources([]);
        setCurrentTopic(null);
        setSuggestedActions([]);
      }

      // 3. Permanently delete from backend SQLite
      await deleteSession(idToDelete);
      if (onSessionUpdate) onSessionUpdate();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage("");
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await askQuestion(text, sessionId);
      const activeId = response?.session_id || sessionId;
      if (activeId && activeId !== sessionId) {
        setSessionId(activeId);
        localStorage.setItem('noor_active_session_id', activeId);
        navigate(`/chat?session=${activeId}`, { replace: true });
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.answer,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const next = [...prev, botMsg];
        if (activeId) {
          try {
            localStorage.setItem(`noor_msgs_${activeId}`, JSON.stringify(next));
          } catch (_) {}
        }
        return next;
      });

      // If backend returned RAG sources, update Spiritual Context sidebar
      if (response.sources && response.sources.length > 0) {
        const parsed = response.sources.slice(0, 4).map((s, idx) => {
          const lines = s.split('\n');
          return {
            title: lines[0]?.replace('---', '').trim() || `Reference ${idx + 1}`,
            snippet: lines.slice(1).join(' ').trim().slice(0, 130) + '...'
          };
        });
        setRelatedSources(parsed);
      }

      if (response.topic) {
        setCurrentTopic(response.topic);
      }

      if (response.suggested_actions) {
        setSuggestedActions(response.suggested_actions);
      }

      if (onSessionUpdate) onSessionUpdate();
      loadRecentSessions(activeId);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "I apologize, but an error occurred while consulting authentic sources. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id, text) => {
    // Strip citation tags before copying
    const plain = text.replace(/\[QURAN\]|\[\/QURAN\]|\[HADITH\]|\[\/HADITH\]/g, '');
    navigator.clipboard.writeText(plain);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Parse [QURAN]/[HADITH] tags AND raw "--- Source X ---" RAG fallback blocks.
   * Renders them as animated, visually rich citation cards.
   */
  const renderMessageContent = (text) => {
    if (!text) return null;

    // ── Keyframe animations injected once into <head> ──────────────────────
    if (!document.getElementById('noor-citation-styles')) {
      const style = document.createElement('style');
      style.id = 'noor-citation-styles';
      style.textContent = `
        @keyframes noor-fadeslide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes noor-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes noor-pulse-border {
          0%, 100% { border-color: rgba(96,165,250,0.6); }
          50%       { border-color: rgba(96,165,250,1); }
        }
        @keyframes noor-gold-pulse {
          0%, 100% { border-color: rgba(234,179,8,0.6); box-shadow: 0 0 0 0 rgba(234,179,8,0); }
          50%       { border-color: rgba(234,179,8,1);   box-shadow: 0 0 12px 2px rgba(234,179,8,0.15); }
        }
        .noor-fadeslide { animation: noor-fadeslide 0.4s ease both; }
        .noor-quran-card { animation: noor-fadeslide 0.45s ease both, noor-gold-pulse 3s ease-in-out infinite; }
        .noor-hadith-card { animation: noor-fadeslide 0.45s ease both, noor-pulse-border 3s ease-in-out infinite; }
        .noor-source-card { animation: noor-fadeslide 0.4s ease both; }
      `;
      document.head.appendChild(style);
    }

    // ── Detect fallback RAG format ("--- Source X ---" blocks) ─────────────
    const isRagFallback = /---\s*Source \d+\s*---/.test(text);
    if (isRagFallback) {
      // Split into: intro text + source blocks
      const introMatch = text.match(/^([\s\S]*?)(?=---\s*Source 1\s*---)/);
      const introText = introMatch ? introMatch[1].trim() : '';
      const sourceBlocks = [...text.matchAll(/---\s*Source (\d+)\s*---([\s\S]*?)(?=---\s*Source \d+\s*---|$)/g)];

      return (
        <div className="space-y-3">
          {/* Intro line */}
          {introText && (
            <p className="text-gray-300 text-xs leading-relaxed noor-fadeslide">{introText}</p>
          )}
          {/* Source cards */}
          {sourceBlocks.map((blk, i) => {
            const num = blk[1];
            const body = blk[2].trim();
            const isQuran = /quran\.txt/i.test(body);
            const isHadith = /hadith/i.test(body);
            const lines = body.split('\n').filter(l => l.trim());
            const titleLine = lines[0] || '';
            const contentLines = lines.slice(1).join('\n').trim();
            const delay = `${i * 0.08}s`;

            if (isQuran) {
              return (
                <div
                  key={i}
                  className="noor-quran-card rounded-2xl border-l-4 overflow-hidden"
                  style={{
                    animationDelay: delay,
                    background: 'linear-gradient(135deg, rgba(161,122,0,0.12) 0%, rgba(234,179,8,0.06) 100%)',
                    borderColor: 'rgba(234,179,8,0.7)',
                    boxShadow: '0 2px 20px rgba(234,179,8,0.08)'
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.18) 0%, transparent 100%)' }}
                  >
                    <span style={{ fontSize: '15px' }}>✨</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#f0c040' }}>
                      Quranic Reference · Source {num}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[11px] font-semibold" style={{ color: 'rgba(234,179,8,0.7)' }}>{titleLine}</p>
                    <p
                      className="text-sm leading-relaxed font-medium"
                      style={{
                        color: '#fde68a',
                        fontFamily: '"Georgia", serif',
                        textShadow: '0 0 20px rgba(234,179,8,0.2)'
                      }}
                    >
                      {contentLines}
                    </p>
                  </div>
                </div>
              );
            }

            if (isHadith) {
              return (
                <div
                  key={i}
                  className="noor-hadith-card rounded-2xl border-l-4 overflow-hidden"
                  style={{
                    animationDelay: delay,
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(96,165,250,0.06) 100%)',
                    borderColor: 'rgba(96,165,250,0.7)',
                    boxShadow: '0 2px 20px rgba(96,165,250,0.08)'
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ background: 'linear-gradient(90deg, rgba(96,165,250,0.18) 0%, transparent 100%)' }}
                  >
                    <span style={{ fontSize: '15px' }}>📜</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#93c5fd' }}>
                      Prophetic Hadith · Source {num}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[11px] font-semibold" style={{ color: 'rgba(96,165,250,0.7)' }}>{titleLine}</p>
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{
                        color: '#bfdbfe',
                        fontFamily: '"Georgia", serif',
                        textShadow: '0 0 20px rgba(96,165,250,0.15)'
                      }}
                    >
                      {contentLines}
                    </p>
                  </div>
                </div>
              );
            }

            // Generic source card
            return (
              <div
                key={i}
                className="noor-source-card rounded-2xl border border-white/10 px-4 py-3"
                style={{ animationDelay: delay, background: 'rgba(255,255,255,0.03)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Source {num}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{body}</p>
              </div>
            );
          })}
        </div>
      );
    }

    // ── Normal mode: [QURAN]/[HADITH] tag parsing + markdown ───────────────
    const segments = [];
    const regex = /\[(QURAN|HADITH)\]([\s\S]*?)\[\/(QURAN|HADITH)\]/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const mdText = text.slice(lastIndex, match.index).trim();
        if (mdText) segments.push({ type: 'markdown', content: mdText });
      }
      segments.push({ type: match[1], content: match[2].trim() });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      const mdText = text.slice(lastIndex).trim();
      if (mdText) segments.push({ type: 'markdown', content: mdText });
    }
    if (segments.length === 0) segments.push({ type: 'markdown', content: text });

    const MarkdownBlock = ({ content, delay = '0s' }) => (
      <div className="noor-fadeslide" style={{ animationDelay: delay }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-gray-200 leading-relaxed" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
            em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-200" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-200" {...props} />,
            li: ({ node, ...props }) => <li className="ml-2" {...props} />,
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h1: ({ node, ...props }) => <h1 className="text-base font-bold text-white mt-3 mb-1" {...props} />,
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-white mt-3 mb-1" {...props} />,
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-emerald-300 mt-2 mb-1" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-2 border-gray-500 pl-3 my-2 text-gray-400 italic" {...props} />
            ),
            code: ({ node, inline, ...props }) =>
              inline
                ? <code className="bg-white/10 rounded px-1 text-emerald-300 font-mono text-[11px]" {...props} />
                : <pre className="bg-black/30 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-gray-300"><code {...props} /></pre>,
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            a: ({ node, ...props }) => <a className="text-emerald-400 underline hover:text-emerald-300" target="_blank" rel="noopener noreferrer" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );

    return (
      <div className="space-y-2">
        {segments.map((seg, i) => {
          const delay = `${i * 0.07}s`;

          if (seg.type === 'QURAN') {
            return (
              <div
                key={i}
                className="noor-quran-card my-3 rounded-2xl border-l-4 overflow-hidden"
                style={{
                  animationDelay: delay,
                  background: 'linear-gradient(135deg, rgba(161,122,0,0.14) 0%, rgba(234,179,8,0.06) 100%)',
                  borderColor: 'rgba(234,179,8,0.75)',
                  boxShadow: '0 2px 24px rgba(234,179,8,0.1)'
                }}
              >
                {/* Header bar */}
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.2) 0%, transparent 100%)' }}
                >
                  <span style={{ fontSize: 16 }}>✨</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#f0c040' }}>
                    Holy Quran
                  </span>
                  <div className="ml-auto flex gap-0.5">
                    {'★★★'.split('').map((s,j) => <span key={j} style={{ color:'rgba(234,179,8,0.4)', fontSize:8 }}>{s}</span>)}
                  </div>
                </div>
                {/* Verse body */}
                <div className="px-4 pb-4 pt-2">
                  <p
                    className="text-sm leading-loose font-medium"
                    style={{
                      color: '#fde68a',
                      fontFamily: '"Georgia", "Times New Roman", serif',
                      textShadow: '0 0 24px rgba(234,179,8,0.25)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    ❝ {seg.content} ❞
                  </p>
                </div>
              </div>
            );
          }

          if (seg.type === 'HADITH') {
            return (
              <div
                key={i}
                className="noor-hadith-card my-3 rounded-2xl border-l-4 overflow-hidden"
                style={{
                  animationDelay: delay,
                  background: 'linear-gradient(135deg, rgba(29,78,216,0.14) 0%, rgba(96,165,250,0.06) 100%)',
                  borderColor: 'rgba(96,165,250,0.75)',
                  boxShadow: '0 2px 24px rgba(96,165,250,0.1)'
                }}
              >
                {/* Header bar */}
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{ background: 'linear-gradient(90deg, rgba(96,165,250,0.2) 0%, transparent 100%)' }}
                >
                  <span style={{ fontSize: 16 }}>📜</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#93c5fd' }}>
                    Prophetic Hadith
                  </span>
                  <div className="ml-auto flex gap-0.5">
                    {'●●●'.split('').map((s,j) => <span key={j} style={{ color:'rgba(96,165,250,0.4)', fontSize:8 }}>{s}</span>)}
                  </div>
                </div>
                {/* Hadith body */}
                <div className="px-4 pb-4 pt-2">
                  <p
                    className="text-sm leading-loose italic"
                    style={{
                      color: '#bfdbfe',
                      fontFamily: '"Georgia", "Times New Roman", serif',
                      textShadow: '0 0 20px rgba(96,165,250,0.2)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    ❝ {seg.content} ❞
                  </p>
                </div>
              </div>
            );
          }

          return <MarkdownBlock key={i} content={seg.content} delay={delay} />;
        })}
      </div>
    );
  };

  const renderLeftSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 space-y-5 overflow-y-auto">
        {/* Brand / Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight font-serif-luxury text-white">
              Noor AI
            </span>
          </div>

          {isDrawer && (
            <button
              onClick={() => setMobileNavOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* New Conversation Button */}
        <button
          onClick={() => {
            handleNewConversation();
            if (isDrawer) setMobileNavOpen(false);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition transform active:scale-98"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>

        {/* Recent Chats Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Recent Chats
            </span>
            {recentSessions.length > 0 && (
              <span className="text-[10px] text-gray-500 font-mono">
                {recentSessions.length}
              </span>
            )}
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {recentSessions.length > 0 ? (
              recentSessions.slice(0, 15).map((sess) => {
                const isActive = sess.id === sessionId;
                const chatTitle = sess.name || sess.title || sess.preview || "Spiritual discussion";
                const isConfirming = deleteConfirmId === sess.id;
                const isDeleting = deletingId === sess.id;

                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setSessionId(sess.id);
                      localStorage.setItem('noor_active_session_id', sess.id);
                      navigate(`/chat?session=${sess.id}`, { replace: true });
                      if (isDrawer) setMobileNavOpen(false);
                    }}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-medium shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <svg
                        className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400/80'} transition`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="truncate text-left" title={chatTitle}>
                        {chatTitle}
                      </span>
                    </div>

                    {/* Delete conversation button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      disabled={isDeleting}
                      className={`shrink-0 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/15 transition-all active:scale-95 ${
                        isConfirming ? 'opacity-100 text-red-400 bg-red-500/15' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title={isConfirming ? "Click again to permanently delete" : "Delete chat"}
                    >
                      {isDeleting ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                      ) : isConfirming ? (
                        <span className="text-[10px] font-bold text-red-400 px-1 uppercase tracking-wider">
                          Delete?
                        </span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-1.5 text-xs text-gray-500 italic">No previous chats</div>
            )}
          </div>
        </div>

        {/* Quick Access & Knowledge Links */}
        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1 block">
            Sacred Exploration
          </span>
          <div className="space-y-1">
            <button
              onClick={() => {
                navigate('/quran');
                if (isDrawer) setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition text-left"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Quran Explorer
            </button>

            <button
              onClick={() => {
                navigate('/hadith');
                if (isDrawer) setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition text-left"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Sahih Hadith Library
            </button>

            <button
              onClick={() => {
                navigate('/duas');
                if (isDrawer) setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition text-left"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              Daily Duas & Adhkar
            </button>

            <button
              onClick={() => {
                navigate('/dashboard');
                if (isDrawer) setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition text-left"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard Overview
            </button>
          </div>
        </div>
      </div>

      {/* Bottom User Pill */}
      <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer min-w-0"
          onClick={() => {
            navigate('/settings');
            if (isDrawer) setMobileNavOpen(false);
          }}
        >
          <div className="w-8 h-8 rounded-full border border-emerald-500/40 overflow-hidden shrink-0">
            <img
              src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=00b875`}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || user?.email?.split('@')[0] || 'Seeker'}</p>
            <span className="text-[10px] text-gray-400 block truncate">{user?.plan || 'Member'}</span>
          </div>
        </div>

        <button
          onClick={() => {
            navigate('/settings');
            if (isDrawer) setMobileNavOpen(false);
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition shrink-0"
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderRightSidebarContent = (isDrawer = false) => (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-serif-luxury font-medium text-white">
          Spiritual Context
        </h3>
        {isDrawer && (
          <button
            onClick={() => setMobileContextOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Section 1: Related Verses / Retrieved References */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Retrieved References
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            {relatedSources.length} Found
          </span>
        </div>

        <div className="space-y-2.5">
          {relatedSources.length > 0 ? (
            relatedSources.map((source, i) => (
              <div
                key={i}
                onClick={() => {
                  if (source.title.toLowerCase().includes("quran")) {
                    navigate('/quran');
                  } else {
                    handleSendMessage(`Explain further from: ${source.title}`);
                  }
                  if (isDrawer) setMobileContextOpen(false);
                }}
                className="p-3.5 rounded-xl bg-[#0b1017] border border-white/[0.06] hover:border-emerald-500/40 cursor-pointer transition space-y-1 group"
              >
                <span className="text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300 block">
                  {source.title}
                </span>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  "{source.snippet}"
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl bg-[#0b1017]/50 border border-white/[0.04] text-xs text-gray-400 leading-relaxed">
              Ask any question to retrieve authentic references from the Holy Quran, Sahih Al-Bukhari, classical Fiqh, and Seerah.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Suggested Actions */}
      <div className="space-y-3 pt-4 border-t border-white/[0.04]">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
          Suggested Actions
        </span>

        <div className="space-y-2">
          {suggestedActions.length > 0 ? (
            suggestedActions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (act.action === 'quran') {
                    navigate('/quran');
                  } else {
                    alert("Dua saved to your personal collection!");
                  }
                  if (isDrawer) setMobileContextOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {act.action === 'quran' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    )}
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-200">
                  {act.title}
                </span>
              </button>
            ))
          ) : (
            <>
              <button
                onClick={() => {
                  navigate('/quran');
                  if (isDrawer) setMobileContextOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-200">
                  Explore 114 Surahs in Quran Reader
                </span>
              </button>
              <button
                onClick={() => {
                  handleSendMessage("What are the authentic morning and evening prophetic adhkar?");
                  if (isDrawer) setMobileContextOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-200">
                  Daily Morning & Evening Adhkar
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section 3: Topic Progress */}
      <div className="p-4 rounded-2xl bg-[#0b1017] border border-white/[0.06] space-y-3 pt-4">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
          Topic Progress
        </span>
        <h4 className="text-xs font-semibold text-white">
          {currentTopic?.name || "Spiritual Inquiries & Learning"}
        </h4>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${currentTopic?.percentage || 15}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {currentTopic
            ? `You've explored ${currentTopic.explored}/${currentTopic.total} themes in this dialogue.`
            : "As you ask questions, Noor tracks your exploration of Islamic themes and sciences."}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="flex-1 flex overflow-hidden bg-[#070a0e] text-gray-100 h-screen h-[100dvh] max-h-[100dvh] w-full selection:bg-emerald-500/30 selection:text-white relative"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* ── Mobile Drawer: Left Sidebar (Recent Chats & Navigation) ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#070b10] border-r border-white/[0.08] h-full flex flex-col justify-between z-10 shadow-2xl">
            {renderLeftSidebarContent(true)}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer: Right Sidebar (Spiritual Context) ── */}
      {mobileContextOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileContextOpen(false)}
          />
          <div className="relative w-84 max-w-[85vw] bg-[#070b10] border-l border-white/[0.08] h-full flex flex-col p-6 space-y-6 overflow-y-auto z-10 shadow-2xl">
            {renderRightSidebarContent(true)}
          </div>
        </div>
      )}

      {/* ── Column 1: Desktop Left Navigation Sidebar ── */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-white/[0.06] bg-[#070b10] flex-col justify-between overflow-hidden">
        {renderLeftSidebarContent(false)}
      </aside>

      {/* ── Column 2: Center Main Chat Stream ── */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden min-w-0 h-full relative">
        
        {/* Top Chat Bar */}
        <header className="h-16 px-4 sm:px-6 border-b border-white/[0.06] bg-[#070a0e]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-10 gap-2">
          
          {/* Left: Mobile Menu Toggle + Advisor Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition shrink-0"
              title="Open chats menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070a0e]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-white truncate">Noor</h3>
              <p className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-emerald-400 truncate">
                ONLINE · SPIRITUAL ADVISOR
              </p>
            </div>
          </div>

          {/* Right: Context Trigger + Quick Nav */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* View Context on Mobile / Tablet */}
            {relatedSources.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileContextOpen(true)}
                className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition"
                title="View spiritual context"
              >
                <span>📖</span>
                <span className="hidden sm:inline">Context ({relatedSources.length})</span>
                <span className="sm:hidden">{relatedSources.length}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/quran')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.2] text-xs font-medium text-gray-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>📖</span>
              <span className="hidden sm:inline">Quran</span>
            </button>

            <button
              onClick={() => navigate('/hadith')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.2] text-xs font-medium text-gray-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>📚</span>
              <span className="hidden sm:inline">Hadith</span>
            </button>

            <button
              onClick={() => navigate('/duas')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.2] text-xs font-medium text-gray-300 hover:text-white transition flex items-center gap-1.5"
            >
              <span>🤲</span>
              <span className="hidden sm:inline">Duas</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 transition flex items-center gap-1.5"
            >
              <span>📊</span>
              <span className="hidden md:inline">Dashboard</span>
            </button>
          </div>
        </header>

        {/* Messages Stream (Strictly bounded container with smooth scroll) */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full relative"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex items-start gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                
                {/* Bot Avatar */}
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </div>
                )}

                {/* Bubble Container */}
                <div className={`max-w-[88%] sm:max-w-xl md:max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {isUser ? (
                    /* User Bubble */
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-normal shadow-lg leading-relaxed break-words">
                      {msg.content}
                    </div>
                  ) : (
                    /* Noor AI Response with scripture formatting */
                    <div className="bg-[#0b1017] border border-white/[0.06] rounded-2xl p-4 sm:p-6 shadow-xl space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-200 leading-relaxed break-words">
                      
                      {/* Formatted body with citation highlighting */}
                      <div>
                        {renderMessageContent(msg.content)}
                      </div>

                      {/* Action buttons (Helpful, Not quite, Copy) */}
                      <div className="pt-3 border-t border-white/[0.04] flex items-center gap-3 sm:gap-4 text-xs text-gray-400 flex-wrap">
                        <button
                          type="button"
                          onClick={() => alert("Thank you for your feedback! Jazaakallahu Khair.")}
                          className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful
                        </button>

                        <button
                          type="button"
                          onClick={() => alert("We noted your feedback to improve guidance accuracy.")}
                          className="flex items-center gap-1.5 hover:text-red-400 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76 1.06m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                          Not quite
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="flex items-center gap-1.5 hover:text-white transition ml-auto sm:ml-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copiedId === msg.id ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-emerald-500/40 overflow-hidden shrink-0 mt-0.5">
                    <img
                      src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=00b875`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5 sm:gap-3.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0b1017] border border-white/[0.06] flex items-center gap-1.5 text-xs text-gray-400">
                <span>Consulting Quran & Sunnah</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 sm:bottom-28 right-4 sm:right-8 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d141f]/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl backdrop-blur-md hover:bg-emerald-500/20 transition-all active:scale-95 animate-bounce"
            title="Scroll to latest messages"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Scroll to bottom</span>
          </button>
        )}

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 md:p-6 bg-[#070a0e]/95 border-t border-white/[0.06] shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            
            {/* Input Pill */}
            <div className="relative flex items-center bg-[#0d131a] border border-white/[0.08] focus-within:border-emerald-500/50 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-inner gap-1">
              
              {/* Attachment Icon */}
              <button
                type="button"
                onClick={() => alert("Attach document/ayah feature")}
                className="p-1.5 text-gray-400 hover:text-white transition shrink-0"
                title="Attach"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Noor about your spiritual journey..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none py-1 min-w-0"
              />

              {/* Mic Icon */}
              <button
                type="button"
                onClick={() => alert("Voice input feature activated")}
                className="p-1.5 text-gray-400 hover:text-emerald-400 transition shrink-0"
                title="Voice input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition disabled:opacity-30 disabled:hover:bg-emerald-500 shadow-md shadow-emerald-900/30 shrink-0"
                title="Send"
              >
                <svg className="w-4 h-4 transform rotate-45 -mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>

            </div>

            {/* Disclaimer */}
            <p className="text-[9px] sm:text-[10px] text-center text-gray-500 uppercase tracking-wider font-semibold">
              Noor AI can provide spiritual guidance but is not a substitute for qualified human scholarship.
            </p>

          </div>
        </div>

      </main>

      {/* ── Column 3: Desktop Right Sidebar ("Spiritual Context") ── */}
      <aside className="hidden xl:flex w-80 shrink-0 border-l border-white/[0.06] bg-[#070b10] flex-col p-6 space-y-6 overflow-y-auto">
        {renderRightSidebarContent(false)}
      </aside>

    </div>
  );
}
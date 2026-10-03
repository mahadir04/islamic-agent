import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UserMenu from "./components/UserMenu";
import { getSessions, createNewSession, deleteSession, getCurrentUser } from "./api";

// ── Animated page wrapper ──────────────────────────────────
function PageWrapper({ children }) {
  return <div className="page-enter flex-1 flex flex-col overflow-hidden">{children}</div>;
}

// ── Main Layout (authenticated pages) ─────────────────────
function MainLayout({
  isDarkMode, setIsDarkMode,
  user, setUser,
  sessions, currentSessionId, isLoadingSessions,
  handleNewChat, handleSelectSession, handleDeleteSession,
  children
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) setIsSidebarOpen(false);
        else setIsSidebarOpen(true);
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => { clearTimeout(timeout); window.removeEventListener("resize", handleResize); };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  const isChat = location.pathname === '/chat';
  const isDash = location.pathname === '/dashboard';

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0c0c10] text-gray-100' : 'bg-[#f5f5f7] text-gray-900'
    }`}>

      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={isSidebarOpen}
        isDarkMode={isDarkMode}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isLoading={isLoadingSessions}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Mobile overlay ── */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className={`
          h-16 flex items-center px-4 md:px-6
          border-b z-20 flex-shrink-0
          transition-all duration-300
          ${isDarkMode
            ? 'bg-[#0c0c10]/80 border-white/[0.06] backdrop-blur-xl'
            : 'bg-white/80 border-gray-200/60 backdrop-blur-xl shadow-sm'
          }
        `}>
          <div className="flex items-center space-x-3 flex-1">
            {/* Hamburger */}
            <button
              onClick={toggleSidebar}
              className={`
                p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
                ${isDarkMode
                  ? 'hover:bg-white/8 text-gray-400 hover:text-white'
                  : 'hover:bg-black/5 text-gray-500 hover:text-gray-900'
                }
              `}
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen && !isMobile ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className={`
                w-8 h-8 rounded-xl flex items-center justify-center
                shadow-inner flex-shrink-0
                ${isDarkMode
                  ? 'bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20'
                  : 'bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/60'
                }
              `}>
                <span className="text-base leading-none">🕌</span>
              </div>
              <h1 className={`text-base font-semibold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Islamic AI
              </h1>
            </div>

            {/* Nav tabs (desktop) */}
            <nav className="hidden md:flex items-center space-x-1 ml-3">
              {[
                { href: '/dashboard', label: 'Dashboard', active: isDash },
                { href: '/chat', label: 'Assistant', active: isChat },
              ].map(({ href, label, active }) => (
                <a
                  key={href}
                  href={href}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? isDarkMode
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-white/6'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-black/4'
                    }
                  `}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode(v => !v)}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center text-base
                transition-all duration-300 hover:scale-110 active:scale-95
                ${isDarkMode
                  ? 'bg-white/8 hover:bg-white/12 border border-white/8 text-yellow-300'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200/60 text-gray-600'
                }
              `}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User menu */}
            {user && <UserMenu isDarkMode={isDarkMode} user={user} setUser={setUser} />}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
}

// ── Loading screen ─────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c10]">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 flex items-center justify-center animate-float">
          <span className="text-3xl">🕌</span>
        </div>
        <div className="flex justify-center space-x-1.5 mb-3">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        <p className="text-gray-500 text-sm">Loading Islamic AI…</p>
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // default dark
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sessions, setSessions]                = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const loaded = await getSessions();
      setSessions(loaded);
      if (loaded.length > 0 && !currentSessionId) {
        setCurrentSessionId(loaded[0].id);
      } else if (loaded.length === 0) {
        const newId = await createNewSession();
        setCurrentSessionId(newId);
      }
    } catch (e) {
      console.error("loadSessions:", e);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]); // eslint-disable-line

  const handleNewChat = async () => {
    try {
      const newId = await createNewSession();
      if (newId) { setCurrentSessionId(newId); await loadSessions(); }
    } catch (e) { console.error(e); }
  };

  const handleSelectSession = (id) => setCurrentSessionId(id);

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      if (id === currentSessionId) {
        const rest = sessions.filter(s => s.id !== id);
        if (rest.length > 0) setCurrentSessionId(rest[0].id);
        else { const newId = await createNewSession(); setCurrentSessionId(newId); }
      }
      await loadSessions();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (userData) { setUser(userData); localStorage.setItem('user', JSON.stringify(userData)); }
          else localStorage.removeItem('token');
        } catch { localStorage.removeItem('token'); }
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) return <LoadingScreen />;

  const token = localStorage.getItem('token');

  const layoutProps = {
    isDarkMode, setIsDarkMode,
    user, setUser,
    sessions, currentSessionId, isLoadingSessions,
    handleNewChat, handleSelectSession, handleDeleteSession,
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} />} />
        <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/chat"
          element={
            token ? (
              <MainLayout {...layoutProps}>
                <Chat isDarkMode={isDarkMode} sessionId={currentSessionId} onSessionUpdate={loadSessions} />
              </MainLayout>
            ) : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            token ? (
              <MainLayout {...layoutProps}>
                <Dashboard isDarkMode={isDarkMode} user={user} />
              </MainLayout>
            ) : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}
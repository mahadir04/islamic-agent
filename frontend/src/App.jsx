import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UserMenu from "./components/UserMenu";
import { getSessions, createNewSession, deleteSession, getCurrentUser } from "./api";

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
  const navigate = useNavigate();

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

  const isChat = location.pathname === '/chat';
  const isDash = location.pathname === '/dashboard';

  return (
    <div className={`h-screen flex overflow-hidden ${
      isDarkMode ? 'bg-[#06090e] text-gray-100' : 'bg-[#f8fafc] text-gray-900'
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

      {/* ── Mobile Overlay ── */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main View ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Header ── */}
        <header className={`
          h-16 flex items-center justify-between px-4 md:px-8 border-b z-20 flex-shrink-0
          ${isDarkMode
            ? 'bg-[#090e15]/90 border-white/10 backdrop-blur-xl'
            : 'bg-white/90 border-gray-200 backdrop-blur-xl shadow-sm'
          }
        `}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-white'
                  : 'border-gray-200 hover:border-emerald-300 text-gray-600'
              }`}
              title="Toggle Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Title / Badges */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-base bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                NOOR AI
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-emerald-200 text-emerald-700 bg-emerald-50'
              }`}>
                Guidance Engine
              </span>
            </div>
          </div>

          {/* Navigation Pill tabs */}
          <div className="hidden sm:flex items-center p-1 rounded-xl border border-white/10 bg-black/20">
            <button
              onClick={() => navigate('/chat')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isChat
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ask Assistant
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isDash
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Right Side: Theme & User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode
                  ? 'border-white/10 hover:border-emerald-500/40 text-amber-400'
                  : 'border-gray-200 hover:border-emerald-300 text-gray-700'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {user && (
              <UserMenu
                user={user}
                onLogout={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  window.location.href = '/';
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </header>

        {/* ── Page Content ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('token'));
      fetchSessions();
    }
  }, []);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data || []);
      if (data?.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSess = await createNewSession();
      if (newSess?.id) {
        setSessions(prev => [newSess, ...prev]);
        setCurrentSessionId(newSess.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSession = (id) => {
    setCurrentSessionId(id);
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) {
        const rem = sessions.filter(s => s.id !== id);
        setCurrentSessionId(rem.length > 0 ? rem[0].id : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} />} />
        <Route path="/login" element={<Login isDarkMode={isDarkMode} onLoginSuccess={(u) => { setUser(u); fetchSessions(); }} />} />
        <Route path="/auth-callback" element={<AuthCallback isDarkMode={isDarkMode} />} />

        {/* Authenticated routes */}
        <Route
          path="/chat"
          element={
            <MainLayout
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              user={user}
              setUser={setUser}
              sessions={sessions}
              currentSessionId={currentSessionId}
              isLoadingSessions={isLoadingSessions}
              handleNewChat={handleNewChat}
              handleSelectSession={handleSelectSession}
              handleDeleteSession={handleDeleteSession}
            >
              <Chat
                isDarkMode={isDarkMode}
                sessionId={currentSessionId}
                onSessionUpdate={fetchSessions}
              />
            </MainLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <MainLayout
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              user={user}
              setUser={setUser}
              sessions={sessions}
              currentSessionId={currentSessionId}
              isLoadingSessions={isLoadingSessions}
              handleNewChat={handleNewChat}
              handleSelectSession={handleSelectSession}
              handleDeleteSession={handleDeleteSession}
            >
              <Dashboard isDarkMode={isDarkMode} />
            </MainLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
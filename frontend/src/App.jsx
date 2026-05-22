import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UserMenu from "./components/UserMenu";
import { getSessions, createNewSession, deleteSession, getCurrentUser } from "./api";
import './App.css';

function MainLayout({ 
  isDarkMode, 
  setIsDarkMode, 
  user, 
  setUser, 
  sessions,
  currentSessionId,
  isLoadingSessions,
  handleNewChat,
  handleSelectSession,
  handleDeleteSession,
  children 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    let timeout;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setIsSidebarOpen(!mobile);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleOverlayClick = () => setIsSidebarOpen(false);

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#0f0f11] text-gray-100' : 'bg-[#fafafa] text-gray-800'
    }`}>
      <div className="flex h-screen">
        {/* Sidebar */}
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
        />

        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleOverlayClick}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile && isSidebarOpen ? 'opacity-30 pointer-events-none' : ''
        }`}>
          {/* Header */}
          <div className={`border-b transition-all duration-300 backdrop-blur-xl z-20 sticky top-0 ${
            isDarkMode ? 'bg-[#0f0f11]/70 border-white/5' : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isSidebarOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700 text-green-400' : 'bg-white border border-gray-200 text-green-600'
                  }`}>
                    <span className="text-sm md:text-base">🕌</span>
                  </div>
                  <h1 className={`text-lg font-semibold tracking-tight ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    <span className="hidden xs:inline">Islamic AI Assistant</span>
                    <span className="xs:hidden">Islamic AI</span>
                  </h1>
                </div>

                <div className="hidden md:flex items-center space-x-1 ml-4 overflow-hidden">
                  <a href="/dashboard" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    window.location.pathname === '/dashboard' 
                      ? isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black' 
                      : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-black/5'
                  }`}>Dashboard</a>
                  <a href="/chat" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    window.location.pathname === '/chat' 
                      ? isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black' 
                      : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-black/5'
                  }`}>Assistant</a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>

                {user && <UserMenu isDarkMode={isDarkMode} user={user} setUser={setUser} />}
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Memoized loadSessions function
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const loadedSessions = await getSessions();
      setSessions(loadedSessions);

      if (loadedSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(loadedSessions[0].id);
      } else if (loadedSessions.length === 0) {
        const newId = await createNewSession();
        setCurrentSessionId(newId);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [currentSessionId]);

  // Load sessions when user is available
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  const handleNewChat = async () => {
    try {
      const newSessionId = await createNewSession();
      if (newSessionId) {
        setCurrentSessionId(newSessionId);
        await loadSessions();
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);

      if (sessionId === currentSessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          const newId = await createNewSession();
          setCurrentSessionId(newId);
        }
      }

      await loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('App initialized, token:', token ? 'Present' : 'Not present');
      
      if (token) {
        try {
          const userData = await getCurrentUser();
          console.log('User data loaded:', userData);
          
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login isDarkMode={isDarkMode} />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<LandingPage isDarkMode={isDarkMode} />} />
        <Route 
          path="/chat" 
          element={
            token ? (
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
                  onSessionUpdate={loadSessions}
                />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            token ? (
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
                <Dashboard isDarkMode={isDarkMode} user={user} />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
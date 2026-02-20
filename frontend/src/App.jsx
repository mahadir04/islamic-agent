import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import UserMenu from "./components/UserMenu";
import { getSessions, createNewSession, deleteSession, getCurrentUser } from "./api";
import './App.css';

function MainApp({ isDarkMode, setIsDarkMode, user, setUser }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
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
        if (isMobile) setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    if (isMobile) setIsSidebarOpen(false);
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleOverlayClick = () => setIsSidebarOpen(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'
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
          <div className={`border-b transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
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
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg md:text-xl">🕌</span>
                  </div>
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    <span className="hidden xs:inline">Islamic AI Assistant</span>
                    <span className="xs:hidden">Islamic AI</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>

                {user && <UserMenu isDarkMode={isDarkMode} user={user} setUser={setUser} />}
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            <Chat 
              isDarkMode={isDarkMode} 
              sessionId={currentSessionId}
              onSessionUpdate={loadSessions}
            />
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
        <Route 
          path="/" 
          element={
            token ? (
              <MainApp 
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                user={user}
                setUser={setUser}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
import { useState, useEffect } from 'react';
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import { getSessions, createNewSession, deleteSession } from "./api";
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto close sidebar on mobile when resizing to mobile
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const loadedSessions = await getSessions();
      setSessions(loadedSessions);
      
      // If no current session and sessions exist, select the most recent
      if (!currentSessionId && loadedSessions.length > 0) {
        setCurrentSessionId(loadedSessions[0].id);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSessionId = await createNewSession();
      setCurrentSessionId(newSessionId);
      await loadSessions();
      
      // On mobile, close sidebar after creating new chat
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    // On mobile, close sidebar after selecting a session
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      
      // If deleted session was current, switch to another or create new
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          const newSessionId = await createNewSession();
          setCurrentSessionId(newSessionId);
        }
      }
      
      await loadSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

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

        {/* Mobile Overlay - only shows when sidebar is open on mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="sidebar-overlay visible"
            onClick={handleOverlayClick}
            aria-label="Close sidebar"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOverlayClick();
              }
            }}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile && isSidebarOpen ? 'main-content-shifted' : ''
        }`}>
          {/* Header */}
          <div className={`border-b transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Sidebar Toggle - Always visible on mobile, hidden on desktop when sidebar is open */}
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  } ${!isMobile && isSidebarOpen ? 'md:hidden' : ''}`}
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isSidebarOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* Title - Hide text on very small screens */}
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full md:rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg md:text-xl">🕌</span>
                  </div>
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    <span className="hidden xs:inline">Islamic AI Assistant</span>
                    <span className="xs:hidden">Islamic AI</span>
                  </h1>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <Chat 
              isDarkMode={isDarkMode} 
              sessionId={currentSessionId}
              onSessionUpdate={loadSessions}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
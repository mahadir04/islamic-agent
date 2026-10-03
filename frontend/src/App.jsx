import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from "./Chat";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import QuranReader from "./pages/QuranReader";
import HadithReader from "./pages/HadithReader";
import Duas from "./pages/Duas";
import Settings from "./pages/Settings";
import { getSessions, getCurrentUser } from "./api";

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [isDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data || []);
      if (data?.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSessionId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('token'));
      fetchSessions();
    }
  }, [fetchSessions]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={localStorage.getItem('token') ? "/dashboard" : "/login"} replace />} />
        
        <Route
          path="/login"
          element={
            <Login
              isDarkMode={isDarkMode}
              onLoginSuccess={(u) => {
                setUser(u);
                fetchSessions();
              }}
            />
          }
        />
        
        {/* Support both /auth/callback and /auth-callback */}
        <Route path="/auth/callback" element={<AuthCallback isDarkMode={isDarkMode} />} />
        <Route path="/auth-callback" element={<AuthCallback isDarkMode={isDarkMode} />} />

        {/* Authenticated routes matching UXPilot screens */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard isDarkMode={isDarkMode} user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quran"
          element={
            <ProtectedRoute user={user}>
              <QuranReader isDarkMode={isDarkMode} user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hadith"
          element={
            <ProtectedRoute user={user}>
              <HadithReader isDarkMode={isDarkMode} user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/duas"
          element={
            <ProtectedRoute user={user}>
              <Duas isDarkMode={isDarkMode} user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <Settings isDarkMode={isDarkMode} user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <Chat
                isDarkMode={isDarkMode}
                sessionId={currentSessionId}
                onSessionUpdate={fetchSessions}
                user={user}
              />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
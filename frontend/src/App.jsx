import { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import Chat from "./Chat";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import QuranReader from "./pages/QuranReader";
import HadithReader from "./pages/HadithReader";
import Duas from "./pages/Duas";
import Settings from "./pages/Settings";
import { getSessions, getCurrentUser } from "./api";

// Safely parse user claims from token for instant UI display
const parseJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const email = parsed.sub || parsed.email || '';
    const name = parsed.name || (email ? email.split('@')[0] : 'Muslim Seeker');
    return {
      email,
      name,
      picture: parsed.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00b875`,
      settings: { theme: 'dark', location: 'Dhaka, Bangladesh' }
    };
  } catch (e) {
    return null;
  }
};

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
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
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
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    // Process deep links from native Android appUrlOpen event (Capacitor)
    const handleIncomingDeepUrl = async (rawUrl) => {
      if (!rawUrl) return;
      try {
        console.log('App opened with URL:', rawUrl);
        // Normalize custom schemes (noorai://auth/callback?token=...)
        const pseudoUrl = rawUrl.replace(/^noorai:\/\//, 'https://noorai.app/');
        const parsed = new URL(pseudoUrl);
        const token = parsed.searchParams.get('token');
        const err = parsed.searchParams.get('error');

        if (token) {
          localStorage.setItem('token', token);
          try {
            await Browser.close();
          } catch (_) {}

          // Set immediate local user from token so UI unlocks without waiting
          const fallbackUser = parseJwtPayload(token);
          if (fallbackUser) {
            setUser(fallbackUser);
            localStorage.setItem('user', JSON.stringify(fallbackUser));
          }

          // Fetch full backend profile in background
          getCurrentUser()
            .then((u) => {
              if (u) {
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
              }
              fetchSessions();
            })
            .catch(() => {
              fetchSessions();
            });

          window.location.hash = '#/dashboard';
        } else if (err) {
          try {
            await Browser.close();
          } catch (_) {}
          window.location.hash = `#/login?error=${encodeURIComponent(err)}`;
        }
      } catch (err) {
        console.error('Error handling deep link URL:', err);
      }
    };

    let handlerPromise = null;
    try {
      handlerPromise = CapApp.addListener('appUrlOpen', (event) => {
        handleIncomingDeepUrl(event?.url);
      });
    } catch (e) {
      // Not running in Capacitor environment
    }

    // Check cold-start launch URL (when app was opened directly by browser deep link)
    try {
      CapApp.getLaunchUrl().then((ret) => {
        if (ret && ret.url) {
          handleIncomingDeepUrl(ret.url);
        }
      }).catch(() => {});
    } catch (e) {}

    // Also check if token was returned in window.location.search or window.location.hash (Web OAuth)
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    const incomingToken = searchParams.get('token') || hashParams.get('token');

    if (incomingToken) {
      localStorage.setItem('token', incomingToken);
      const fallbackUser = parseJwtPayload(incomingToken);
      if (fallbackUser) {
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      }
      getCurrentUser()
        .then(u => {
          if (u) {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }
          fetchSessions();
        })
        .catch(console.error);
    }

    return () => {
      if (handlerPromise && typeof handlerPromise.then === 'function') {
        handlerPromise.then(h => h.remove()).catch(() => {});
      }
    };
  }, [fetchSessions]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(u => {
          if (u) {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }
        })
        .catch(err => {
          // ONLY clear token if the server explicitly returned 401 Unauthorized
          if (err?.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
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
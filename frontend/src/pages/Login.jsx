import { useState, useEffect } from 'react';

export default function Login({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('token')) window.location.href = '/chat';
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const err = p.get('error');
    if (!err) return;
    const msgs = {
      auth_failed:           'Authentication failed. Please try again.',
      access_denied:         'Access denied. Please try again.',
      token_exchange_failed: 'Failed to authenticate with Google.',
      no_code:               'No authorization code received.',
      oauth_not_configured:  'Google OAuth is not configured.',
    };
    setError(msgs[err] || `Authentication error: ${err}`);
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center px-4
      transition-colors duration-500
      ${isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'}
    `}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full
          bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className={`
        relative w-full max-w-sm animate-scale-in
        rounded-2xl border p-8
        ${isDarkMode
          ? 'bg-[#12121a]/90 border-white/[0.07] shadow-2xl shadow-black/60 backdrop-blur-xl'
          : 'bg-white/90 border-gray-200/60 shadow-xl backdrop-blur-xl'
        }
      `}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5
            animate-float
            ${isDarkMode
              ? 'bg-emerald-500/15 border border-emerald-500/20 shadow-inner'
              : 'bg-emerald-50 border border-emerald-200/60 shadow-sm'
            }
          `}>
            <span className="text-3xl">🕌</span>
          </div>

          <h1 className={`text-2xl font-bold tracking-tight mb-1.5 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Welcome back
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Sign in to access your Islamic AI Assistant
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className={`
            mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5
            animate-slide-down
            ${isDarkMode
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-600'
            }
          `}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-xl font-semibold text-sm
            flex items-center justify-center gap-3
            transition-all duration-200 btn-glow
            ${loading ? 'opacity-70 cursor-not-allowed scale-100' : 'hover:scale-[1.02] active:scale-[0.98]'}
            ${isDarkMode
              ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/5'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20'
            }
          `}
        >
          {loading ? (
            <>
              <div className={`
                w-5 h-5 border-2 border-t-transparent rounded-full animate-spin
                ${isDarkMode ? 'border-gray-400' : 'border-white/40'}
              `} />
              <span>Redirecting…</span>
            </>
          ) : (
            <>
              {/* Google G logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className={`flex items-center gap-3 my-6`}>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>secure login</span>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4">
          {['🔒 Encrypted', '✅ No data sold', '🕌 Islamic focus'].map((badge, i) => (
            <span key={i} className={`text-[11px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {badge}
            </span>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/" className={`text-xs hover:underline ${isDarkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
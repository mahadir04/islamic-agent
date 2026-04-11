import { useState, useEffect } from 'react';

export default function Login({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/chat';
    }
  }, []);

  // Check for error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      if (error === 'auth_failed') {
        setError('Authentication failed. Please try again.');
      } else if (error === 'access_denied') {
        setError('You denied access to your account. Please try again.');
      } else if (error === 'token_exchange_failed') {
        setError('Failed to authenticate with Google. Please try again.');
      } else if (error === 'no_code') {
        setError('No authorization code received. Please try again.');
      } else if (error === 'oauth_not_configured') {
        setError('Google OAuth is not configured. Please contact support.');
      } else {
        setError(`Authentication error: ${error}`);
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0f0f11]' : 'bg-[#fafafa]'
    }`}>
      <div className={`max-w-md w-full mx-4 p-10 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
        isDarkMode ? 'bg-[#1a1a1a]/80 border-white/5 shadow-2xl shadow-black/50' : 'bg-white/80 border-gray-200/50 shadow-xl shadow-gray-200/50'
      }`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-green-400' : 'bg-white border-gray-100 text-green-600'
          }`}>
            <span className="text-2xl">🕌</span>
          </div>
          <h1 className={`text-2xl font-semibold tracking-tight mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Welcome back
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sign in to access your Islamic AI Assistant
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-3 ${
            isDarkMode
              ? 'bg-white text-black hover:scale-105 shadow-sm hover:shadow-white/10'
              : 'bg-[#101010] text-white hover:scale-[1.02] shadow-sm hover:shadow-black/10'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                isDarkMode ? 'border-black/30 text-black' : 'border-white/30 text-white'
              }`}></div>
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Demo Note */}
        <p className={`mt-6 text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  );
}
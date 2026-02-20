import { useState, useEffect } from 'react';

export default function Auth({ isDarkMode, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } else {
        setError(`Authentication error: ${error}`);
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    // Redirect to Google OAuth
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/auth/google`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'
    }`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl">🕌</span>
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Islamic AI Assistant
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sign in with your Google account to access your conversations
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
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Redirecting to Google...</span>
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

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`mt-6 p-3 rounded-lg text-xs ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            <p className="font-medium mb-1">Debug Info:</p>
            <p>Backend URL: {process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}</p>
            <p>Redirect URI: {`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/auth/google/callback`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
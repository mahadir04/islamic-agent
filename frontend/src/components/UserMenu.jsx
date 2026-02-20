import { useState } from 'react';
import Profile from './Profile';

export default function UserMenu({ isDarkMode, user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <img
            src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=32`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
          />
          <span className={`text-sm font-medium hidden md:block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {user?.name?.split(' ')[0]}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {/* User Info */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=40`}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user?.name}
                    </p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left rounded-lg flex items-center space-x-3 transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left rounded-lg flex items-center space-x-3 transition-colors ${
                    isDarkMode
                      ? 'hover:bg-red-600 hover:text-white text-gray-300'
                      : 'hover:bg-red-500 hover:text-white text-gray-700'
                  }`}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          isDarkMode={isDarkMode}
          onClose={() => setShowProfile(false)}
          onUpdate={() => {
            // Refresh user data
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(userData);
          }}
        />
      )}
    </>
  );
}
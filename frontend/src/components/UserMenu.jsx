import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';

export default function UserMenu({ isDarkMode, user, setUser }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const avatarSrc = user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff&size=64`;

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-2 focus:outline-none group"
        >
          <img
            src={avatarSrc}
            alt={user?.name}
            className="w-8 h-8 rounded-xl object-cover border-2 border-emerald-500/40 group-hover:border-emerald-500 transition-all duration-200"
          />
          <span className={`text-sm font-medium hidden md:block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {user?.name?.split(' ')[0]}
          </span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={`
            absolute right-0 top-full mt-2 w-60
            rounded-2xl border shadow-2xl z-50
            animate-slide-down overflow-hidden
            ${isDarkMode
              ? 'bg-[#16161f] border-white/[0.08] shadow-black/60'
              : 'bg-white border-gray-100 shadow-gray-200/60'
            }
          `}>
            {/* User info */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-500/30"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {user?.name}
                  </p>
                  <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              {[
                {
                  icon: '📊', label: 'Dashboard',
                  onClick: () => { navigate('/dashboard'); setIsOpen(false); }
                },
                {
                  icon: '💬', label: 'Chat',
                  onClick: () => { navigate('/chat'); setIsOpen(false); }
                },
                {
                  icon: '👤', label: 'Profile',
                  onClick: () => { setShowProfile(true); setIsOpen(false); }
                },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`
                    w-full px-3 py-2 rounded-xl flex items-center gap-3
                    text-sm text-left transition-all duration-150
                    ${isDarkMode
                      ? 'text-gray-300 hover:bg-white/6 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </button>
              ))}

              <div className={`my-1 h-px ${isDarkMode ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />

              <button
                onClick={handleLogout}
                className={`
                  w-full px-3 py-2 rounded-xl flex items-center gap-3
                  text-sm text-left transition-all duration-150
                  ${isDarkMode
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-500 hover:bg-red-50'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <Profile
          isDarkMode={isDarkMode}
          onClose={() => setShowProfile(false)}
          onUpdate={() => {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(userData);
          }}
        />
      )}
    </>
  );
}
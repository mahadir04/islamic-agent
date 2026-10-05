import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppNavigation({
  isOpen,
  onClose,
  onOpen,
  user,
  hideBottomNav = false,
  readMode = false
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [quickQuery, setQuickQuery] = useState('');

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      arabic: 'الرئيسية',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      desc: 'Prayers, Sunnah tracker & Guidance'
    },
    {
      path: '/chat',
      label: 'Ask Noor AI',
      arabic: 'المستشار الذكي',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      desc: 'Authentic Islamic AI Scholar & Fiqh',
      badge: 'AI'
    },
    {
      path: '/quran',
      label: 'Noble Quran',
      arabic: 'القرآن الكريم',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      desc: '114 Surahs, Audio Recitation & Tafsir'
    },
    {
      path: '/hadith',
      label: 'Sahih Hadith',
      arabic: 'الحديث الشريف',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      desc: '97 Books of Bukhari with Voice Play'
    },
    {
      path: '/duas',
      label: 'Daily Duas & Adhkar',
      arabic: 'الأدعية والأذكار',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      desc: 'Morning, evening & prayer dhikr counter'
    },
    {
      path: '/settings',
      label: 'Settings & Preferences',
      arabic: 'الإعدادات',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      desc: 'Madhab, calculation method & location'
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(quickQuery.trim())}&new=1`);
    setQuickQuery('');
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    navigate('/login');
    if (onClose) onClose();
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Seeker';
  const displayAvatar = user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=00b875`;

  return (
    <>
      {/* ── Slide-Over Sidebar Drawer ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="relative w-84 max-w-[88vw] bg-[#070b10] border-r border-white/[0.08] h-full flex flex-col justify-between z-10 shadow-2xl overflow-hidden transition-transform duration-300 transform translate-x-0">
            
            {/* Header Brand & Close */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-b from-[#0a111a] to-[#070b10]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-amber-500/10 border border-emerald-500/40 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/40">
                  🕌
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    NOOR AI
                  </h2>
                  <p className="text-[11px] text-emerald-400/80 font-arabic tracking-wide">
                    نُورُ الإِسْلَام · Spiritual Companion
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition"
                aria-label="Close Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Ask AI Input in Sidebar */}
            <div className="px-4 pt-4 pb-2">
              <form onSubmit={handleQuickSearch} className="relative">
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Ask a question or topic..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0c1219] hover:bg-[#0f1722] focus:bg-[#0f1722] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition shadow-inner"
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none text-xs">
                  💬
                </span>
              </form>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
              <div className="px-2 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                  Main Features
                </span>
                <span className="text-[10px] text-gray-500 font-mono">6 Sections</span>
              </div>

              {navItems.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600/25 to-teal-600/10 border border-emerald-500/40 text-white shadow-md shadow-emerald-950/30'
                        : 'border border-transparent hover:border-white/[0.06] hover:bg-white/[0.04] text-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-gray-400 group-hover:text-white'
                    }`}>
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold truncate ${isActive ? 'text-emerald-300' : 'text-gray-200'}`}>
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-[11px] font-arabic text-gray-500">
                            {item.arabic}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* User Footer Profile & Logout */}
            <div className="p-4 border-t border-white/[0.08] bg-[#090f16] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {user?.email || 'Logged in'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-gray-500">
                <span>Authentic Islamic Knowledge</span>
                <span className="text-emerald-400/80">v2.4 Online</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Mobile Bottom Navigation Bar (Visible on mobile/tablet unless in Read Mode) ── */}
      {!hideBottomNav && !readMode && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#070b10]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              currentPath === '/dashboard' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Quran */}
          <button
            type="button"
            onClick={() => navigate('/quran')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              currentPath.startsWith('/quran') ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-medium">Quran</span>
          </button>

          {/* Ask Noor (Center highlight) */}
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="flex flex-col items-center -mt-4 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${
              currentPath.startsWith('/chat')
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 ring-4 ring-[#070b10]'
                : 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 ring-4 ring-[#070b10]'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 mt-1">Ask Noor</span>
          </button>

          {/* Hadith */}
          <button
            type="button"
            onClick={() => navigate('/hadith')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              currentPath.startsWith('/hadith') ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-medium">Hadith</span>
          </button>

          {/* More (Opens Full Features Sidebar Drawer) */}
          <button
            type="button"
            onClick={() => {
              if (isOpen) {
                if (onClose) onClose();
              } else {
                if (onOpen) onOpen();
                else if (onClose) onClose(true);
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
              isOpen ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[10px] font-medium">Features</span>
          </button>
        </nav>
      )}
    </>
  );
}

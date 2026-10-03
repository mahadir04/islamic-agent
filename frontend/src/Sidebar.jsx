import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  isOpen, isDarkMode,
  sessions, currentSessionId,
  onSelectSession, onNewChat, onDeleteSession,
  isLoading, isMobile, onClose,
}) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (deleteConfirm === sessionId) {
      onDeleteSession(sessionId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(sessionId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    const now = new Date();
    const mins  = Math.floor((now - d) / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24)return `${hours}h ago`;
    if (days < 7)  return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const filteredSessions = sessions.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const baseClass = `
    flex flex-col flex-shrink-0 z-50
    transition-all duration-300
    ${isDarkMode
      ? 'bg-[#0f0f14] border-r border-white/[0.05]'
      : 'bg-white border-r border-gray-200/60 shadow-sm'
    }
  `;

  if (isMobile) {
    return (
      <>
        <div className={`
          ${baseClass}
          fixed inset-y-0 left-0
          w-[280px] sidebar-mobile
          ${!isOpen ? 'closed' : ''}
        `}>
          <SidebarContent
            isDarkMode={isDarkMode}
            sessions={filteredSessions}
            allSessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => { onSelectSession(id); onClose(); }}
            onNewChat={() => { onNewChat(); onClose(); }}
            handleDelete={handleDelete}
            deleteConfirm={deleteConfirm}
            isLoading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            formatDate={formatDate}
            navigate={navigate}
            onClose={onClose}
            isMobile={true}
          />
        </div>
      </>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={`${baseClass} w-[280px] sidebar-enter`}>
      <SidebarContent
        isDarkMode={isDarkMode}
        sessions={filteredSessions}
        allSessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        handleDelete={handleDelete}
        deleteConfirm={deleteConfirm}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        formatDate={formatDate}
        navigate={navigate}
      />
    </div>
  );
}

// ── Inner content ──────────────────────────────────────────
function SidebarContent({
  isDarkMode, sessions, allSessions,
  currentSessionId, onSelectSession, onNewChat,
  handleDelete, deleteConfirm, isLoading,
  searchTerm, setSearchTerm, formatDate, navigate,
  onClose, isMobile
}) {
  return (
    <>
      {/* Header */}
      <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? 'border-white/[0.05]' : 'border-gray-100'}`}>

        {/* Mobile close + brand row */}
        {isMobile && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`
                w-7 h-7 rounded-lg flex items-center justify-center text-sm
                ${isDarkMode
                  ? 'bg-emerald-500/15 border border-emerald-500/20'
                  : 'bg-emerald-50 border border-emerald-200/60'
                }
              `}>🕌</div>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Islamic AI
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-white/8 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* New Chat button */}
        <button
          onClick={onNewChat}
          className={`
            w-full py-2.5 px-4 rounded-xl font-medium text-sm
            flex items-center justify-center gap-2
            transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
            btn-glow
            ${isDarkMode
              ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-md shadow-emerald-900/30'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-400/20'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        {/* Search */}
        <div className="relative mt-3">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full py-2 pl-8 pr-3 rounded-lg text-xs
              border outline-none transition-all duration-200
              ${isDarkMode
                ? 'bg-white/[0.04] border-white/[0.06] text-gray-300 placeholder-gray-600 focus:border-emerald-500/30'
                : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-emerald-300'
              }
            `}
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="space-y-2 px-1 pt-1">
            {[1,2,3].map(i => (
              <div key={i}
                className={`h-16 rounded-xl ${isDarkMode ? 'skeleton' : 'skeleton-light'}`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3
              ${isDarkMode ? 'bg-white/4' : 'bg-gray-50'}
            `}>💬</div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'No chats found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Start a new chat above
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session, idx) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`
                    group relative p-3 rounded-xl cursor-pointer
                    transition-all duration-200 animate-fade-in
                    ${isActive
                      ? isDarkMode
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-emerald-50 border border-emerald-200/60'
                      : isDarkMode
                        ? 'hover:bg-white/4 border border-transparent'
                        : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-start gap-2.5 pr-6">
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs mt-0.5
                      ${isActive
                        ? isDarkMode
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-emerald-100 text-emerald-700'
                        : isDarkMode
                          ? 'bg-white/6 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                      }
                    `}>
                      💬
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate mb-0.5 ${
                        isActive
                          ? isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                          : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {session.name || 'New Chat'}
                      </p>
                      <p className={`text-[11px] truncate ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {session.preview || 'No messages yet'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[11px] ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`}>
                          {formatDate(session.updated_at)}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                          isDarkMode ? 'bg-white/6 text-gray-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {session.message_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    title={deleteConfirm === session.id ? 'Click again to confirm' : 'Delete'}
                    className={`
                      absolute top-2.5 right-2 p-1 rounded-lg
                      opacity-0 group-hover:opacity-100 transition-all duration-200
                      ${deleteConfirm === session.id
                        ? 'opacity-100 bg-red-500 text-white'
                        : isDarkMode
                          ? 'bg-white/6 text-gray-500 hover:bg-red-500/80 hover:text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white'
                      }
                    `}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t flex-shrink-0 ${isDarkMode ? 'border-white/[0.05]' : 'border-gray-100'}`}>
        {/* Nav links (only on desktop sidebar) */}
        <div className="space-y-1 mb-3">
          {[
            { href: '/dashboard', icon: '📊', label: 'Dashboard' },
            { href: '/chat',      icon: '💬', label: 'Assistant' },
          ].map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-150
                ${isDarkMode
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-white/4'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>

        <div className={`text-[11px] ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`}>
          <p className="font-medium">Islamic AI Assistant</p>
          <p className="mt-0.5">{allSessions?.length || 0} conversations · Authentic sources</p>
        </div>
      </div>
    </>
  );
}
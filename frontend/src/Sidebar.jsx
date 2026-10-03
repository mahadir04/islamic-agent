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

  const filteredSessions = sessions.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerClass = `
    flex flex-col flex-shrink-0 z-50 transition-all duration-300
    ${isDarkMode
      ? 'bg-[#090e15] border-r border-white/10 text-gray-200'
      : 'bg-white border-r border-gray-200 text-gray-800 shadow-sm'
    }
  `;

  if (isMobile) {
    return (
      <div className={`
        ${containerClass} fixed inset-y-0 left-0 w-[290px]
        ${!isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <SidebarContent
          isDarkMode={isDarkMode}
          sessions={filteredSessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => { onSelectSession(id); onClose(); }}
          onNewChat={() => { onNewChat(); onClose(); }}
          handleDelete={handleDelete}
          deleteConfirm={deleteConfirm}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          navigate={navigate}
          onClose={onClose}
          isMobile={true}
        />
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={`${containerClass} w-[290px]`}>
      <SidebarContent
        isDarkMode={isDarkMode}
        sessions={filteredSessions}
        currentSessionId={currentSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        handleDelete={handleDelete}
        deleteConfirm={deleteConfirm}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        navigate={navigate}
      />
    </div>
  );
}

function SidebarContent({
  isDarkMode, sessions, currentSessionId,
  onSelectSession, onNewChat, handleDelete, deleteConfirm,
  isLoading, searchTerm, setSearchTerm, navigate, onClose, isMobile
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Brand & Sacred Header ── */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/25 via-amber-500/10 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-lg">
              🕌
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                NOOR AI
              </h2>
              <p className="text-[11px] text-gray-400 font-arabic">نُورُ الإِسْلَام</p>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── New Chat CTA Button ── */}
        <button
          onClick={onNewChat}
          className="mt-4 w-full py-2.5 px-3.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-base leading-none">+</span>
          <span>New Discussion</span>
        </button>
      </div>

      {/* ── Search Input ── */}
      <div className="p-3">
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs
          ${isDarkMode ? 'bg-[#0d141f] border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}
        `}>
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none placeholder-gray-500 text-xs"
          />
        </div>
      </div>

      {/* ── Sessions List ── */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 px-2 py-1.5">
          Recent Inquiries
        </p>

        {isLoading ? (
          <div className="p-4 text-center text-xs text-gray-500">Loading history…</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500">No conversations found.</div>
        ) : (
          sessions.map((s) => {
            const active = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`
                  group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer border transition-all
                  ${active
                    ? isDarkMode
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isDarkMode
                      ? 'border-transparent hover:bg-white/5 text-gray-300'
                      : 'border-transparent hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-gray-600'}`} />
                  <span className="truncate">{s.name || 'Spiritual Inquiry'}</span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-opacity ${
                    deleteConfirm === s.id ? 'opacity-100 text-red-400 font-bold' : 'text-gray-500'
                  }`}
                  title={deleteConfirm === s.id ? "Click again to confirm" : "Delete"}
                >
                  {deleteConfirm === s.id ? "Confirm?" : "✕"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ── Islamic Resource Quick Links ── */}
      <div className={`p-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-2 rounded-lg border text-center transition-all ${
              isDarkMode
                ? 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5 text-gray-300'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate('/quran')}
            className={`p-2 rounded-lg border text-center transition-all ${
              isDarkMode
                ? 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5 text-gray-300'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            📖 Quran
          </button>
          <button
            onClick={() => navigate('/hadith')}
            className={`p-2 rounded-lg border text-center transition-all ${
              isDarkMode
                ? 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5 text-gray-300'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            📚 Hadith
          </button>
          <button
            onClick={() => navigate('/duas')}
            className={`p-2 rounded-lg border text-center transition-all ${
              isDarkMode
                ? 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5 text-gray-300'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700'
            }`}
          >
            🤲 Daily Duas
          </button>
        </div>
      </div>
    </div>
  );
}
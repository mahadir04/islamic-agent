import { useState } from 'react';

export default function Sidebar({
  isOpen,
  isDarkMode,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isLoading,
  isMobile
}) {
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
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredSessions = sessions.filter(session =>
    session.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={`w-80 flex flex-col transition-all duration-300 ${
      isDarkMode ? 'bg-[#111113] border-r border-white/5' : 'bg-[#fafafa] border-r border-gray-200/50'
    } ${isMobile && !isOpen ? 'sidebar-hidden' : ''}`}>
      
      {/* Sidebar Header */}
      <div className={`p-5 pb-4 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200/50'}`}>
        <button
          onClick={onNewChat}
          className={`w-full py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
            isDarkMode
              ? 'bg-white text-black hover:scale-105 shadow-sm hover:shadow-white/10'
              : 'bg-[#101010] text-white hover:scale-105 shadow-sm hover:shadow-black/10'
          }`}
        >
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 px-3 pl-9 rounded-xl text-sm transition-colors duration-200 bg-transparent ${
              isDarkMode
                ? 'border border-gray-700 text-white placeholder-gray-500 focus:border-white/20 hover:border-white/10'
                : 'border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-gray-300 hover:border-gray-300'
            } focus:outline-none`}
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkMode ? 'border-green-400' : 'border-green-600'
            }`}></div>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading chats...
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className={`text-6xl mb-4 opacity-50`}>💬</div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'No chats found' : 'No chats yet'}
            </p>
            {!searchTerm && (
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Start a new chat to begin
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 mx-1 ${
                  currentSessionId === session.id
                    ? isDarkMode
                      ? 'bg-white/5 border border-white/5'
                      : 'bg-black/5 border border-black/5'
                    : isDarkMode
                      ? 'border border-transparent hover:bg-white/5'
                      : 'border border-transparent hover:bg-black/5'
                }`}
              >
                {/* Chat Icon and Name */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-70 ${
                    isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-200/50 text-gray-600'
                  }`}>
                    <span className="text-sm tracking-tighter">💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold tracking-tight text-sm mb-0.5 truncate ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {session.name || 'New Chat'}
                    </div>
                    
                    {/* Message Preview */}
                    <div className={`text-xs mb-2 truncate ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {session.preview || 'No messages yet'}
                    </div>

                    {/* Session Meta */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {formatDate(session.updated_at)}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {session.message_count || 0} msgs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    deleteConfirm === session.id
                      ? 'bg-red-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                        : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
                  }`}
                  title={deleteConfirm === session.id ? 'Click again to confirm' : 'Delete chat'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className={`p-5 text-[11px] text-center tracking-wide ${
        isDarkMode ? 'text-gray-600' : 'text-gray-400'
      }`}>
        <p>Islamic AI Assistant</p>
        <p className="mt-1">Based on authentic sources</p>
        <p className="mt-1 text-[10px]">{sessions.length} conversations</p>
      </div>
    </div>
  );
}
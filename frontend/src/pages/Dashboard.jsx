import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, getSessions } from '../api';

export default function Dashboard({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, sessionsData] = await Promise.all([
          getUserStats(),
          getSessions()
        ]);
        setStats(statsData);
        setRecentSessions(sessionsData.slice(0, 4));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Welcome Header */}
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {getGreeting()}, <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Welcome to your Islamic AI Assistant dashboard.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-sm font-medium opacity-60 mb-1">Total Conversations</h3>
            <p className="text-3xl font-bold tracking-tight">{stats?.total_chats || 0}</p>
          </div>
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-sm font-medium opacity-60 mb-1">Messages Exchanged</h3>
            <p className="text-3xl font-bold tracking-tight">{stats?.total_messages || 0}</p>
          </div>
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-3xl mb-4">🗓️</div>
            <h3 className="text-sm font-medium opacity-60 mb-1">Member Since</h3>
            <p className="text-xl font-bold tracking-tight">
              {stats?.joined_date ? new Date(stats.joined_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Recent Sessions</h2>
              <button 
                onClick={() => navigate('/chat')}
                className={`text-sm font-medium ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
              >
                View all chats
              </button>
            </div>
            
            <div className="space-y-4">
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => navigate(`/chat`)} // Ideally pass sessionId but for now simplified
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                      isDarkMode ? 'bg-[#1a1a1a]/30 border-white/5 hover:bg-[#1a1a1a]/50' : 'bg-white border-gray-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        💬
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-medium truncate">{session.name || 'Conversation'}</h4>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {session.preview || 'No preview available'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                      <div className={`text-xs font-semibold group-hover:translate-x-1 transition-transform ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Resume →
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 rounded-3xl border border-dashed ${
                  isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                  <p className="mb-4">No recent activity found.</p>
                  <button 
                    onClick={() => navigate('/chat')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Start your first chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Topics & Quick Access */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-6">Topic Summary</h2>
            <div className={`p-6 rounded-3xl border ${
              isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Topics you've frequently discussed with the AI.
              </p>
              <div className="flex flex-wrap gap-2">
                {stats?.favorite_topics?.map((topic, i) => (
                  <span 
                    key={i}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 border border-white/5 hover:border-white/20' 
                        : 'bg-gray-50 text-gray-700 border border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className={`mt-6 p-6 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-xl shadow-green-900/10`}>
              <h3 className="font-semibold mb-2">Need Guidance?</h3>
              <p className="text-sm opacity-90 mb-4 text-white/80">
                The Islamic AI is ready to help with prayer times, fiqh rulings, and Quranic tafsir.
              </p>
              <button 
                onClick={() => navigate('/chat')}
                className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium backdrop-blur-md transition-all"
              >
                Go to Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

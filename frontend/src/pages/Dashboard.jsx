import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, getSessions } from '../api';

// ── Animated stat counter ──────────────────────────────────
function StatCard({ icon, label, value, isDarkMode, delay = 0, accent }) {
  return (
    <div
      className={`
        stat-card p-6 rounded-2xl border animate-fade-in
        ${isDarkMode
          ? 'bg-[#13131a] border-white/[0.06]'
          : 'bg-white border-gray-100/80 shadow-sm'
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${
        isDarkMode ? `bg-${accent}-500/10 border border-${accent}-500/20` : `bg-${accent}-50 border border-${accent}-200/60`
      }`}>
        {icon}
      </div>
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold tracking-tight animate-counter ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}

export default function Dashboard({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [stats, setStats]                 = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsData, sessionsData] = await Promise.all([getUserStats(), getSessions()]);
        setStats(statsData);
        setRecentSessions(sessionsData.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getIslamicGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "May your morning be blessed 🌅";
    if (h < 17) return "May your afternoon be productive 🌤️";
    return "May your evening be peaceful 🌙";
  };

  if (loading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${
        isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/20 flex items-center justify-center animate-float">
          <span className="text-2xl">📊</span>
        </div>
        <div className="flex space-x-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#0c0c10]' : 'bg-[#f5f5f7]'}`}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* ── Welcome header ── */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-500/30"
              />
            )}
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {getGreeting()},{' '}
                <span className="gradient-text">{user?.name?.split(' ')[0] || 'Friend'}</span>
              </h1>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {getIslamicGreeting()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon="💬" label="Total Conversations" value={stats?.total_chats ?? 0}
            isDarkMode={isDarkMode} delay={0} accent="emerald" />
          <StatCard icon="⚡" label="Messages Exchanged" value={stats?.total_messages ?? 0}
            isDarkMode={isDarkMode} delay={100} accent="blue" />
          <StatCard
            icon="🗓️" label="Member Since"
            value={stats?.joined_date ? new Date(stats.joined_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'N/A'}
            isDarkMode={isDarkMode} delay={200} accent="amber"
          />
        </div>

        {/* ── Bottom grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent sessions */}
          <div className="lg:col-span-2 animate-fade-in delay-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Recent Sessions
              </h2>
              <button
                onClick={() => navigate('/chat')}
                className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
              >
                View all →
              </button>
            </div>

            <div className="space-y-2">
              {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                <div
                  key={session.id}
                  onClick={() => navigate('/chat')}
                  className={`
                    group flex items-center justify-between p-4 rounded-xl border cursor-pointer
                    transition-all duration-200 hover:-translate-y-0.5 animate-fade-in
                    ${isDarkMode
                      ? 'bg-[#13131a] border-white/[0.06] hover:border-emerald-500/20'
                      : 'bg-white border-gray-100/80 hover:border-emerald-200/60 shadow-sm hover:shadow-md'
                    }
                  `}
                  style={{ animationDelay: `${350 + i * 60}ms` }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                      w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0
                      ${isDarkMode ? 'bg-white/4' : 'bg-gray-50'}
                    `}>
                      💬
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {session.name || 'Conversation'}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {session.preview || 'No preview'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4">
                    <p className={`text-[11px] mb-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                    <p className={`text-xs font-semibold transition-transform group-hover:translate-x-0.5 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>Resume →</p>
                  </div>
                </div>
              )) : (
                <div className={`
                  text-center py-12 rounded-2xl border border-dashed animate-fade-in delay-300
                  ${isDarkMode ? 'border-white/[0.06] text-gray-500' : 'border-gray-200 text-gray-400'}
                `}>
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm mb-4">No conversations yet</p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:scale-105 transition-all shadow-md"
                  >
                    Start your first chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 animate-fade-in delay-400">

            {/* Topics */}
            <div>
              <h2 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Your Topics
              </h2>
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#13131a] border-white/[0.06]' : 'bg-white border-gray-100/80 shadow-sm'
              }`}>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Topics you've explored with the AI
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(stats?.favorite_topics || ['Prayer', 'Fasting', 'Quran']).map((topic, i) => (
                    <span
                      key={i}
                      className={`
                        px-2.5 py-1 rounded-lg text-[11px] font-medium border
                        animate-fade-in
                        ${isDarkMode
                          ? 'bg-emerald-500/8 border-emerald-500/15 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                        }
                      `}
                      style={{ animationDelay: `${450 + i * 60}ms` }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xl shadow-emerald-900/30 relative overflow-hidden">
              {/* decorative circles */}
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="absolute -right-6 bottom-2 w-28 h-28 rounded-full bg-white/5" />

              <div className="relative">
                <div className="text-2xl mb-2">🕌</div>
                <h3 className="font-semibold text-sm mb-1.5">Need Guidance?</h3>
                <p className="text-xs opacity-80 mb-4 leading-relaxed">
                  The Islamic AI is ready to help with prayer, fiqh rulings, and Quranic tafsir.
                </p>
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
                >
                  Open Assistant →
                </button>
              </div>
            </div>

            {/* Quick stats info */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#13131a] border-white/[0.06]' : 'bg-white border-gray-100/80 shadow-sm'
            }`}>
              <p className={`text-xs font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Info</p>
              <div className="space-y-2">
                {[
                  { label: 'Email', val: user?.email || '—' },
                  { label: 'Last active', val: stats?.last_active ? new Date(stats.last_active).toLocaleDateString() : '—' },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{label}</span>
                    <span className={`text-xs font-medium truncate ml-2 max-w-[140px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

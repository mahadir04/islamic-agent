import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDuas } from '../api';

export default function Duas({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [counters, setCounters] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Adhkar', icon: '✨' },
    { id: 'morning', label: 'Morning Adhkar', icon: '🌅', arabic: 'أذكار الصباح' },
    { id: 'evening', label: 'Evening Adhkar', icon: '🌆', arabic: 'أذكار المساء' },
    { id: 'sleep', label: 'Before Sleep', icon: '🌙', arabic: 'أذكار النوم' },
    { id: 'prayer', label: 'After Prayer', icon: '🕌', arabic: 'أذكار بعد الصلاة' },
    { id: 'distress', label: 'Distress & Relief', icon: '🤲', arabic: 'تفريج الكرب' },
    { id: 'forgiveness', label: 'Forgiveness', icon: '🕊️', arabic: 'الاستغفار' },
  ];

  useEffect(() => {
    async function fetchDuas() {
      setLoading(true);
      try {
        const list = await getDuas(selectedCategory, searchQuery);
        setDuas(list);
      } catch (err) {
        console.error("Failed to load duas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDuas();
  }, [selectedCategory, searchQuery]);

  const handleIncrementCounter = (duaId, maxCount) => {
    setCounters(prev => {
      const current = prev[duaId] || 0;
      const next = current + 1;
      return {
        ...prev,
        [duaId]: next > maxCount ? 0 : next
      };
    });
  };

  const handleResetCounter = (duaId) => {
    setCounters(prev => ({ ...prev, [duaId]: 0 }));
  };

  const handleCopyDua = (dua) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\nReference: ${dua.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskInChat = (dua) => {
    const q = `Explain the deeper spiritual meanings and virtues of the prophetic supplication: "${dua.title}" (${dua.reference})`;
    navigate(`/chat?q=${encodeURIComponent(q)}&new=1`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070a0e] text-gray-100 min-h-screen selection:bg-emerald-500/30 selection:text-white"
         style={{
           backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
           backgroundSize: '24px 24px'
         }}>
      
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-30 w-full bg-[#070a0e]/85 backdrop-blur-md border-b border-white/[0.06] px-6 lg:px-12 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight font-serif-luxury text-white">
            Noor AI
          </span>
        </div>

        {/* Center Nav Pills */}
        <div className="hidden sm:flex items-center p-1 rounded-xl border border-white/[0.08] bg-[#0c1219]">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/quran')}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Quran
          </button>
          <button
            onClick={() => navigate('/hadith')}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Hadith
          </button>
          <button
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shadow-sm"
          >
            Daily Duas
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Ask Noor
          </button>
        </div>

        {/* Right: Settings & Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full border border-emerald-500/40 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500/40 transition"
          >
            <img
              src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=00b875`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-6xl w-full mx-auto px-6 lg:px-12 py-8 space-y-8 flex-1">
        
        {/* Hero Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              Authentic Supplications
            </span>
            <span className="text-gray-500 text-xs">·</span>
            <span className="text-gray-400 text-xs font-arabic">أَدْعِيَةٌ وَأَذْكَارٌ نَبَوِيَّةٌ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-luxury font-medium text-white tracking-tight">
            Daily Duas & Prophetic Adhkar
          </h1>
          <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Authentic supplications from the Holy Quran, Sahih Al-Bukhari, Sahih Muslim, and Hisn al-Muslim (Fortress of the Muslim), equipped with an interactive counter for your daily spiritual practice.
          </p>
        </section>

        {/* Search & Categories Bar */}
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, meaning, or hadith reference..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0d131a] hover:bg-[#101822] focus:bg-[#101822] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                      : 'bg-[#0b1017] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duas List */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading authentic prophetic supplications...</p>
          </div>
        ) : duas.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0b1017] border border-white/[0.06] p-8 space-y-3">
            <div className="text-3xl">🤲</div>
            <p className="text-sm font-medium text-white">No Duas found</p>
            <p className="text-xs text-gray-400">Try adjusting your search query or choosing another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {duas.map((dua) => {
              const currentCount = counters[dua.id] || 0;
              const isCompleted = currentCount >= dua.repeat;
              const isCopied = copiedId === dua.id;

              return (
                <div
                  key={dua.id}
                  className={`rounded-2xl p-6 md:p-8 bg-[#0b1017] border transition-all shadow-xl space-y-6 ${
                    isCompleted
                      ? 'border-emerald-500/40 bg-[#0a1418]'
                      : 'border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  {/* Top Bar: Category badge, Title, and Action Tools */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {dua.category}
                        </span>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {dua.repeat} {dua.repeat === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-serif-luxury font-medium text-white">
                        {dua.title}
                      </h3>
                    </div>

                    {/* Action Tools */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyDua(dua)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center gap-1.5 transition"
                        title="Copy Dua"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{isCopied ? "Copied!" : "Copy"}</span>
                      </button>

                      <button
                        onClick={() => handleAskInChat(dua)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 transition"
                        title="Reflect in Chat with Noor"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                        <span>Reflect</span>
                      </button>
                    </div>
                  </div>

                  {/* Sacred Arabic Text */}
                  <div className="text-right font-arabic text-2xl md:text-3xl text-emerald-300 leading-loose py-2 select-text">
                    {dua.arabic}
                  </div>

                  {/* Transliteration */}
                  <div className="bg-[#0e1620] rounded-xl p-4 border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1">
                      Transliteration
                    </span>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-sans italic">
                      "{dua.transliteration}"
                    </p>
                  </div>

                  {/* Translation */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                      Meaning
                    </span>
                    <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
                      "{dua.translation}"
                    </p>
                  </div>

                  {/* Benefit & Virtue Banner */}
                  {dua.benefit && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                          Recorded Virtue & Benefit
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {dua.benefit}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Row: Reference citation & Digital Tasbih Counter */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Source: <span className="text-gray-300">{dua.reference}</span>
                    </span>

                    {/* Interactive Tasbih Counter */}
                    <div className="flex items-center gap-3">
                      {currentCount > 0 && (
                        <button
                          onClick={() => handleResetCounter(dua.id)}
                          className="text-[11px] text-gray-500 hover:text-gray-300 transition"
                          title="Reset count"
                        >
                          Reset
                        </button>
                      )}

                      <button
                        onClick={() => handleIncrementCounter(dua.id, dua.repeat)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 shadow-md ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-emerald-950/40'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        <span>
                          {isCompleted ? "Completed ✓" : `Tap to Count: ${currentCount} / ${dua.repeat}`}
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

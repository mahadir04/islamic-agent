import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getHadithBooks, getHadithBook, searchHadiths } from '../api';
import AppNavigation from '../components/AppNavigation';

export default function HadithReader({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBookId = parseInt(searchParams.get('book') || '1', 10);

  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(initialBookId);
  const [currentBookData, setCurrentBookData] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingHadiths, setLoadingHadiths] = useState(true);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [readMode, setReadMode] = useState(false);
  const [mobileBookOpen, setMobileBookOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hadithFontSize, setHadithFontSize] = useState(15);
  const [readingTheme, setReadingTheme] = useState('dark');

  // Voice Playback State (Web Speech API)
  const [playingHadithId, setPlayingHadithId] = useState(null);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en');
  const [voiceRate, setVoiceRate] = useState(1.0);

  // Load 97 Books list
  useEffect(() => {
    async function fetchBooks() {
      try {
        const list = await getHadithBooks();
        setBooks(list);
      } catch (e) {
        console.error("Failed to load hadith books list:", e);
      } finally {
        setLoadingBooks(false);
      }
    }
    fetchBooks();
  }, []);

  // Load selected Book hadiths
  useEffect(() => {
    async function fetchBookDetail() {
      if (globalSearchResults !== null) return;
      setLoadingHadiths(true);
      try {
        const data = await getHadithBook(selectedBookId, page, 30);
        if (data) {
          setCurrentBookData(data);
        }
      } catch (e) {
        console.error(`Failed to load hadith book ${selectedBookId}:`, e);
      } finally {
        setLoadingHadiths(false);
      }
    }
    fetchBookDetail();
  }, [selectedBookId, page, globalSearchResults]);

  // Clean up speech synthesis on unmount or book switch
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingHadithId(null);
    setIsVoicePaused(false);
  }, [selectedBookId, page]);

  const handlePlayHadithVoice = (hadith, forcedLang = null) => {
    if (!('speechSynthesis' in window)) {
      alert("Voice playback is not supported on this browser.");
      return;
    }

    const currentLang = forcedLang || voiceLang;

    // Toggle pause / resume if same Hadith
    if (playingHadithId === hadith.hadithNumber) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsVoicePaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsVoicePaused(true);
      }
      return;
    }

    // Cancel previous audio
    window.speechSynthesis.cancel();

    let textToSpeak = '';
    let speechLang = 'en-US';

    if (currentLang === 'ar' && hadith.text_ar) {
      textToSpeak = hadith.text_ar;
      speechLang = 'ar-SA';
    } else {
      textToSpeak = `${hadith.narrator ? hadith.narrator + '. ' : ''}${hadith.text_en}`;
      speechLang = 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLang;
    utterance.rate = voiceRate;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang.startsWith(speechLang.slice(0, 2)));
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      setPlayingHadithId(hadith.hadithNumber);
      setIsVoicePaused(false);
    };

    utterance.onend = () => {
      setPlayingHadithId(null);
      setIsVoicePaused(false);
    };

    utterance.onerror = () => {
      setPlayingHadithId(null);
      setIsVoicePaused(false);
    };

    utterance.onpause = () => {
      setIsVoicePaused(true);
    };

    utterance.onresume = () => {
      setIsVoicePaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingHadithId(null);
    setIsVoicePaused(false);
  };

  const handlePauseResumeVoice = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsVoicePaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsVoicePaused(true);
    }
  };

  const handleSelectBook = (bookNumber) => {
    setSelectedBookId(bookNumber);
    setPage(1);
    setGlobalSearchResults(null);
    setGlobalSearchQuery('');
    setSearchParams({ book: bookNumber.toString() });
    setMobileBookOpen(false);
  };

  const handlePrevBook = () => {
    if (selectedBookId > 1) {
      handleSelectBook(selectedBookId - 1);
    }
  };

  const handleNextBook = () => {
    if (selectedBookId < (books.length || 97)) {
      handleSelectBook(selectedBookId + 1);
    }
  };

  const toggleBookmark = (hNum) => {
    setBookmarkedHadiths(prev => ({
      ...prev,
      [hNum]: !prev[hNum]
    }));
  };

  const handleCopy = (hadith) => {
    const text = `${hadith.reference}\n${hadith.narrator ? hadith.narrator + ' ' : ''}${hadith.text_en}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.hadithNumber);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAskInChat = (hadith) => {
    const snippet = hadith.text_en.length > 200 ? hadith.text_en.substring(0, 197) + "..." : hadith.text_en;
    const q = `Explain the authentic lessons, context, and spiritual application of ${hadith.reference}: "${snippet}"`;
    navigate(`/chat?q=${encodeURIComponent(q)}&new=1`);
  };

  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults(null);
      return;
    }
    setIsSearchingGlobal(true);
    try {
      const results = await searchHadiths(globalSearchQuery.trim(), 40);
      setGlobalSearchResults(results);
    } catch (err) {
      console.error("Global search failed:", err);
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  const clearGlobalSearch = () => {
    setGlobalSearchQuery('');
    setGlobalSearchResults(null);
  };

  const filteredBooks = books.filter(b => {
    const term = searchFilter.toLowerCase();
    return (
      b.name?.toLowerCase().includes(term) ||
      b.name_ar?.includes(term) ||
      b.number?.toString() === term
    );
  });

  const renderBookSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Top: Title & Search */}
      <div className="p-4 border-b border-white/[0.06] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <div>
              <h3 className="text-sm font-serif-luxury font-medium text-white">
                Sahih al-Bukhari
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">
                97 Books · 7,554 Hadiths
              </span>
            </div>
          </div>

          {isDrawer ? (
            <button
              onClick={() => setMobileBookOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08]"
              title="Close"
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
              title="Clear Filter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Books */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter books (e.g. Prayer, Belief)..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0d131a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Books Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingBooks ? (
          <div className="p-4 text-center text-xs text-gray-500">Loading Hadith Books...</div>
        ) : (
          filteredBooks.map((b) => {
            const isSelected = b.number === selectedBookId && globalSearchResults === null;
            return (
              <div
                key={b.number}
                onClick={() => handleSelectBook(b.number)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-sm'
                    : 'hover:bg-white/[0.03] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/[0.04] text-gray-400'
                  }`}>
                    {b.number}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {b.name}
                    </p>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {b.hadiths_count} Hadiths · {b.start_hadith}-{b.end_hadith}
                    </span>
                  </div>
                </div>

                <div className="text-right font-arabic text-xs text-emerald-400/90 shrink-0 ml-2 max-w-[90px] truncate">
                  {b.name_ar}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div
      className="flex-1 flex flex-col bg-[#070a0e] text-gray-100 h-screen h-[100dvh] max-h-[100dvh] overflow-hidden selection:bg-emerald-500/30 selection:text-white relative"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* ── Mobile Drawer: Books Selection ── */}
      {mobileBookOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileBookOpen(false)}
          />
          <div className="relative w-84 max-w-[85vw] bg-[#070b10] border-r border-white/[0.08] h-full flex flex-col overflow-hidden z-10 shadow-2xl">
            {renderBookSidebarContent(true)}
          </div>
        </div>
      )}

      {/* ── Top Header Navigation Bar ── */}
      {readMode ? (
        <header className="sticky top-0 z-30 w-full bg-[#070b10]/95 backdrop-blur-xl border-b border-emerald-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-2 shadow-2xl">
          {/* Left: Book Title & Quick Switcher */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileBookOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition shrink-0"
              title="Change Book"
            >
              <span>📚</span>
              <span className="truncate max-w-[130px] sm:max-w-none">Book {selectedBookId}: {currentBookData?.book?.name || "Hadith Book"}</span>
              <svg className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Center: Font Size & Voice Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font size adjustments */}
            <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setHadithFontSize(prev => Math.max(12, prev - 1))}
                className="px-2 py-1 hover:text-emerald-400 text-gray-300 transition"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="px-1.5 text-[11px] text-gray-400 font-mono">{hadithFontSize}px</span>
              <button
                type="button"
                onClick={() => setHadithFontSize(prev => Math.min(24, prev + 1))}
                className="px-2 py-1 hover:text-emerald-400 text-gray-300 transition font-bold"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Voice Lang Toggle */}
            <button
              type="button"
              onClick={() => setVoiceLang(voiceLang === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-gray-300 hover:text-emerald-300 transition"
              title="Toggle Audio Language"
            >
              Voice: {voiceLang.toUpperCase()}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setReadingTheme(readingTheme === 'dark' ? 'sepia' : readingTheme === 'sepia' ? 'navy' : 'dark')}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-gray-300 hover:text-white transition"
              title="Reading theme"
            >
              <span>{readingTheme === 'dark' ? '🖤 Dark' : readingTheme === 'sepia' ? '📜 Sepia' : '🌙 Navy'}</span>
            </button>
          </div>

          {/* Right: Exit Read Mode Button */}
          <button
            type="button"
            onClick={() => setReadMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition shrink-0"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Exit Read Mode</span>
          </button>
        </header>
      ) : (
        <header className="sticky top-0 z-30 w-full bg-[#070a0e]/90 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between shrink-0 gap-2">
          {/* Left: Hamburger & Brand + Mobile Book Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.08] transition flex items-center justify-center border border-white/[0.08] shrink-0"
              title="Open Features Menu"
              aria-label="Open Navigation Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight font-serif-luxury text-white hidden sm:inline">
                Noor AI
              </span>
            </div>

            {/* Mobile Book Switcher Button */}
            <button
              type="button"
              onClick={() => setMobileBookOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition shrink-0"
              title="Browse all 97 Books"
            >
              <span>📚</span>
              <span className="font-semibold truncate max-w-[120px]">
                {currentBookData?.book?.name || "Hadith Books"}
              </span>
              <svg className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Center Nav Pills */}
          <div className="hidden sm:flex items-center p-1 rounded-xl border border-white/[0.08] bg-[#0c1219]">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/quran')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Quran
            </button>
            <button
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shadow-sm"
            >
              Hadith
            </button>
            <button
              onClick={() => navigate('/duas')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Daily Duas
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Ask Noor
            </button>
          </div>

          {/* Right: Quick Links & Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setReadMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition"
              title="Enter full Read Mode"
            >
              <span>📖</span>
              <span className="hidden sm:inline">Read Mode</span>
            </button>

            <div
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full border border-emerald-500/40 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500/40 transition shrink-0"
            >
              <img
                src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}&backgroundColor=00b875`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
      )}

      {/* ── Main Body Split: Book Sidebar & Hadiths View ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* ── Desktop Left Sidebar: 97 Books List ── */}
        {!readMode && (
          <aside className="hidden lg:flex w-80 shrink-0 border-r border-white/[0.06] bg-[#070b10] flex-col overflow-hidden">
            {renderBookSidebarContent(false)}
          </aside>
        )}

        {/* ── Main View: Hadiths Stream ── */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
          
          {/* Global Hadith Search Bar */}
          <form onSubmit={handleGlobalSearch} className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search all 7,554 Hadiths by keyword (intentions, prayer, fasting, charity, patience) or narrator..."
              className="w-full pl-10 pr-24 py-2.5 bg-[#0b1017] border border-white/[0.08] focus:border-emerald-500/50 rounded-2xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition shadow-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1.5">
              {globalSearchResults !== null && (
                <button
                  type="button"
                  onClick={clearGlobalSearch}
                  className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.06]"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={isSearchingGlobal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              >
                {isSearchingGlobal ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results Notice Banner */}
          {globalSearchResults !== null && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  Search Results for "{globalSearchQuery}"
                </p>
                <p className="text-[11px] text-gray-400">
                  Found {globalSearchResults.length} authentic Hadiths across Sahih al-Bukhari
                </p>
              </div>
              <button
                onClick={clearGlobalSearch}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Back to Book {selectedBookId}
              </button>
            </div>
          )}

          {/* Book Header Card (when not in global search mode) */}
          {globalSearchResults === null && (
            <div className="bg-[#0b1017] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Sahih al-Bukhari · Book {selectedBookId}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Grade: Sahih (Authentic)
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-white tracking-tight">
                  {currentBookData?.book?.name || 'Revelation'}
                </h2>
                <p className="text-xs text-gray-400">
                  Total in chapter: <span className="text-gray-200 font-semibold">{currentBookData?.total || 0} Hadiths</span> (Numbers {currentBookData?.book?.start_hadith} - {currentBookData?.book?.end_hadith})
                </p>
              </div>

              {/* Arabic Book Name & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                <div className="font-arabic text-xl sm:text-2xl text-emerald-400 shrink-0">
                  {currentBookData?.book?.name_ar}
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev Book Button */}
                  <button
                    type="button"
                    onClick={handlePrevBook}
                    disabled={selectedBookId <= 1}
                    className="p-2 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Previous Book"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Next Book Button */}
                  <button
                    type="button"
                    onClick={handleNextBook}
                    disabled={selectedBookId >= (books.length || 97)}
                    className="p-2 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Next Book"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Read Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setReadMode(!readMode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      readMode
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.08]'
                    }`}
                    title="Toggle Read Mode"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden sm:inline">{readMode ? 'Exit Read Mode' : 'Read Mode'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hadiths Stream */}
          {loadingHadiths && globalSearchResults === null ? (
            <div className="py-20 text-center text-xs text-gray-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <p>Loading authentic Hadiths...</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {(globalSearchResults || currentBookData?.hadiths || []).map((hadith) => {
                const isBookmarked = bookmarkedHadiths[hadith.hadithNumber];
                const isCopied = copiedId === hadith.hadithNumber;

                return (
                  <div
                    key={hadith.hadithNumber}
                    className={`rounded-2xl p-5 sm:p-6 transition-all shadow-md space-y-4 ${
                      playingHadithId === hadith.hadithNumber
                        ? 'bg-[#0a1420] border-2 border-emerald-500/50 shadow-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'bg-[#0b1017]/70 border border-white/[0.05] hover:border-emerald-500/30'
                    }`}
                  >
                    {/* Top Meta Bar */}
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          {hadith.reference || `Sahih al-Bukhari ${hadith.hadithNumber}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-white/[0.04] text-gray-400">
                          Book {hadith.bookNumber}: {hadith.bookName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-400 bg-emerald-500/10">
                          Sahih
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Voice Listen Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayHadithVoice(hadith)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            playingHadithId === hadith.hadithNumber
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                              : 'text-gray-300 hover:text-emerald-300 hover:bg-white/[0.06] border border-white/[0.08]'
                          }`}
                          title="Listen to Hadith voice narration"
                        >
                          {playingHadithId === hadith.hadithNumber ? (
                            <>
                              <span className="text-[10px] tracking-tighter animate-pulse">ılılı</span>
                              <span>{isVoicePaused ? 'Paused' : 'Playing'}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(hadith)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition relative"
                          title="Copy Hadith"
                        >
                          {isCopied ? (
                            <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>

                        {/* Bookmark */}
                        <button
                          type="button"
                          onClick={() => toggleBookmark(hadith.hadithNumber)}
                          className={`p-1.5 rounded-lg transition ${
                            isBookmarked ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                          }`}
                          title="Bookmark"
                        >
                          <svg className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Narrator */}
                    {hadith.narrator && (
                      <div className="text-xs sm:text-sm font-semibold text-emerald-400/90 tracking-wide">
                        {hadith.narrator}
                      </div>
                    )}

                    {/* Hadith English Text */}
                    <div
                      className="text-gray-200 leading-relaxed font-normal"
                      style={{ fontSize: `${hadithFontSize}px` }}
                    >
                      "{hadith.text_en}"
                    </div>

                    {/* Bottom Tools & Noor AI Sparkle */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                      <span className="text-[11px] text-gray-500">
                        {hadith.collection}
                      </span>

                      <button
                        onClick={() => handleAskInChat(hadith)}
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1 px-2.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 transition"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                        <span>Reflect in Chat</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls (when viewing large books) */}
          {globalSearchResults === null && currentBookData?.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-xs text-gray-300 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Previous Page
              </button>
              <span className="text-xs text-gray-400 px-2 font-mono">
                Page {page} of {currentBookData.total_pages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(currentBookData.total_pages, p + 1))}
                disabled={page >= currentBookData.total_pages}
                className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-xs text-gray-300 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
              >
                Next Page →
              </button>
            </div>
          )}

          {/* Bottom Next / Prev Book Navigation Cards */}
          {globalSearchResults === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/[0.06]">
              {selectedBookId > 1 && (
                <div
                  onClick={handlePrevBook}
                  className="p-4 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 cursor-pointer transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition">
                    ←
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                      Previous Book
                    </span>
                    <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                      Book {selectedBookId - 1}: {books[selectedBookId - 2]?.name}
                    </p>
                  </div>
                </div>
              )}

              {selectedBookId < (books.length || 97) && (
                <div
                  onClick={handleNextBook}
                  className="p-4 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 cursor-pointer transition flex items-center justify-between group sm:col-start-2"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                      Next Book
                    </span>
                    <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                      Book {selectedBookId + 1}: {books[selectedBookId]?.name}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition">
                    →
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Floating Hadith Voice Playback Controller ── */}
      {playingHadithId && (
        <div className="fixed bottom-16 md:bottom-6 inset-x-4 max-w-md mx-auto z-40 bg-[#09111b]/95 border border-emerald-500/40 rounded-2xl p-3.5 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-xs animate-slide-up">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="animate-pulse">🔊</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">Reciting Hadith #{playingHadithId}</p>
              <p className="text-[10px] text-emerald-400/80">
                {voiceLang === 'ar' ? 'Arabic Recitation' : 'English Narration'} · {voiceRate}x
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switch */}
            <button
              onClick={() => {
                const next = voiceLang === 'ar' ? 'en' : 'ar';
                setVoiceLang(next);
                const currentHadith = (globalSearchResults || currentBookData?.hadiths || []).find(h => h.hadithNumber === playingHadithId);
                if (currentHadith) handlePlayHadithVoice(currentHadith, next);
              }}
              className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-bold text-gray-300 transition"
              title="Toggle Arabic / English"
            >
              {voiceLang.toUpperCase()}
            </button>

            {/* Speed Switch */}
            <button
              onClick={() => {
                const rates = [0.8, 1.0, 1.25];
                const nextRate = rates[(rates.indexOf(voiceRate) + 1) % rates.length];
                setVoiceRate(nextRate);
              }}
              className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] text-gray-300 font-mono transition"
              title="Playback Speed"
            >
              {voiceRate}x
            </button>

            {/* Pause/Resume */}
            <button
              onClick={handlePauseResumeVoice}
              className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition"
              title={isVoicePaused ? "Resume" : "Pause"}
            >
              {isVoicePaused ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>

            {/* Stop */}
            <button
              onClick={handleStopVoice}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
              title="Stop Playback"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Global Responsive Navigation Drawer & Bottom Nav ── */}
      <AppNavigation
        isOpen={sidebarOpen}
        onClose={(v) => setSidebarOpen(typeof v === 'boolean' ? v : false)}
        user={user}
        readMode={readMode}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSurahs, getSurah, getAyahTafsir } from '../api';
import AppNavigation from '../components/AppNavigation';

export default function QuranReader({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurahId = parseInt(searchParams.get('surah') || '1', 10);

  const [surahs, setSurahs] = useState([]);
  const [selectedSurahId, setSelectedSurahId] = useState(initialSurahId);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'juz'
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [activeInsightVerse, setActiveInsightVerse] = useState(null);
  const [tafsirCache, setTafsirCache] = useState({});
  const [loadingTafsir, setLoadingTafsir] = useState({});
  const [bookmarkedVerses, setBookmarkedVerses] = useState({});
  const [readMode, setReadMode] = useState(false);
  const [mobileSurahOpen, setMobileSurahOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState(28);
  const [showTranslation, setShowTranslation] = useState(true);
  const [readingTheme, setReadingTheme] = useState('dark');

  // Load 114 Surahs
  useEffect(() => {
    async function fetchSurahList() {
      try {
        const list = await getSurahs();
        setSurahs(list);
      } catch (e) {
        console.error("Failed to load surahs list:", e);
      } finally {
        setLoadingSurahs(false);
      }
    }
    fetchSurahList();
  }, []);

  // Load selected Surah details and verses
  useEffect(() => {
    async function fetchSurahDetail() {
      setLoadingVerses(true);
      if (audioObj) {
        audioObj.pause();
        setPlayingAudio(null);
      }
      try {
        const detail = await getSurah(selectedSurahId);
        if (detail) {
          setCurrentSurah(detail);
          setActiveInsightVerse(null);
        }
      } catch (e) {
        console.error(`Failed to load surah ${selectedSurahId}:`, e);
      } finally {
        setLoadingVerses(false);
      }
    }
    fetchSurahDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurahId]);

  const handleToggleInsight = async (vNum) => {
    if (activeInsightVerse === vNum) {
      setActiveInsightVerse(null);
      return;
    }
    setActiveInsightVerse(vNum);
    const key = `${selectedSurahId}:${vNum}`;
    if (!tafsirCache[key]) {
      setLoadingTafsir(prev => ({ ...prev, [key]: true }));
      try {
        const tafsir = await getAyahTafsir(selectedSurahId, vNum);
        if (tafsir) {
          setTafsirCache(prev => ({ ...prev, [key]: tafsir }));
        }
      } catch (err) {
        console.error("Failed to load tafsir:", err);
      } finally {
        setLoadingTafsir(prev => ({ ...prev, [key]: false }));
      }
    }
  };



  const toggleBookmark = (vNum) => {
    setBookmarkedVerses(prev => ({
      ...prev,
      [`${selectedSurahId}:${vNum}`]: !prev[`${selectedSurahId}:${vNum}`]
    }));
  };

  const handlePlayAudio = (vNum, audioUrl) => {
    if (!audioUrl) return;
    if (playingAudio === vNum && audioObj) {
      audioObj.pause();
      setPlayingAudio(null);
      return;
    }
    if (audioObj) audioObj.pause();

    const audio = new Audio(audioUrl);
    setAudioObj(audio);
    setPlayingAudio(vNum);
    audio.play().catch(e => console.error("Audio playback error:", e));
    audio.onended = () => setPlayingAudio(null);
  };

  const handleAskTafsirInChat = (vNum, textEn) => {
    const q = `Explain the Tafsir and spiritual reflection of Surah ${currentSurah?.englishName} (${selectedSurahId}:${vNum}): "${textEn}"`;
    navigate(`/chat?q=${encodeURIComponent(q)}&new=1`);
  };

  const handleSelectSurah = (surahNumber) => {
    setSelectedSurahId(surahNumber);
    setSearchParams({ surah: surahNumber });
    setMobileSurahOpen(false);
  };

  const handlePrevSurah = () => {
    if (selectedSurahId > 1) {
      handleSelectSurah(selectedSurahId - 1);
    }
  };

  const handleNextSurah = () => {
    if (selectedSurahId < 114) {
      handleSelectSurah(selectedSurahId + 1);
    }
  };

  const filteredSurahs = surahs.filter(s => {
    const term = searchFilter.toLowerCase();
    return (
      s.englishName?.toLowerCase().includes(term) ||
      s.englishNameTranslation?.toLowerCase().includes(term) ||
      s.number?.toString() === term
    );
  });

  const renderSurahSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Top: Title, Search & Tabs */}
      <div className="p-4 border-b border-white/[0.06] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-serif-luxury font-medium text-white">
              Surahs
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">
              (114)
            </span>
          </div>

          {isDrawer ? (
            <button
              onClick={() => setMobileSurahOpen(false)}
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

        {/* Search Filter */}
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
            placeholder="Search Surah by name, number..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0d131a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* LIST vs JUZ toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0d131a] border border-white/[0.08] text-center text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-1 rounded-lg transition uppercase text-[10px] tracking-wider ${
              activeTab === 'list'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            List (114)
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`py-1 rounded-lg transition uppercase text-[10px] tracking-wider ${
              activeTab === 'juz'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Juz (30)
          </button>
        </div>
      </div>

      {/* Surahs Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingSurahs ? (
          <div className="p-4 text-center text-xs text-gray-500">Loading Surahs...</div>
        ) : (
          filteredSurahs.map((s) => {
            const isSelected = s.number === selectedSurahId;
            return (
              <div
                key={s.number}
                onClick={() => handleSelectSurah(s.number)}
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
                    {s.number}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {s.englishName}
                    </p>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block truncate">
                      {s.englishNameTranslation} · {s.numberOfAyahs} verses
                    </span>
                  </div>
                </div>

                <div className="text-right font-arabic text-sm text-emerald-400 shrink-0 ml-2">
                  {s.name}
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
      {/* ── Mobile Drawer: Surahs Selection ── */}
      {mobileSurahOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSurahOpen(false)}
          />
          <div className="relative w-84 max-w-[85vw] bg-[#070b10] border-r border-white/[0.08] h-full flex flex-col overflow-hidden z-10 shadow-2xl">
            {renderSurahSidebarContent(true)}
          </div>
        </div>
      )}

      {/* ── Top Header Navigation Bar ── */}
      {readMode ? (
        <header className="sticky top-0 z-30 w-full bg-[#070b10]/95 backdrop-blur-xl border-b border-emerald-500/20 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-2 shadow-2xl">
          {/* Left: Surah Title & Quick Drawer */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSurahOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition shrink-0"
              title="Change Surah"
            >
              <span>📖</span>
              <span className="truncate max-w-[120px] sm:max-w-none">{selectedSurahId}. {currentSurah?.englishName}</span>
              <span className="font-arabic text-sm text-emerald-400 hidden sm:inline">({currentSurah?.name})</span>
              <svg className="w-3.5 h-3.5 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Center: Font Size & Translation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font size adjustments */}
            <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setArabicFontSize(prev => Math.max(18, prev - 3))}
                className="px-2 py-1 hover:text-emerald-400 text-gray-300 transition"
                title="Decrease Arabic font size"
              >
                A-
              </button>
              <span className="px-1.5 text-[11px] text-gray-400 font-mono">{arabicFontSize}px</span>
              <button
                type="button"
                onClick={() => setArabicFontSize(prev => Math.min(46, prev + 3))}
                className="px-2 py-1 hover:text-emerald-400 text-gray-300 transition font-bold"
                title="Increase Arabic font size"
              >
                A+
              </button>
            </div>

            {/* Translation Toggle */}
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                showTranslation
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-gray-400'
              }`}
            >
              <span className="hidden sm:inline">{showTranslation ? 'Translation: On' : 'Arabic Only'}</span>
              <span className="sm:hidden">{showTranslation ? 'EN' : 'AR'}</span>
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
          {/* Left: Hamburger & Brand + Mobile Surah Switcher */}
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

            {/* Mobile Surah Switcher Button */}
            <button
              type="button"
              onClick={() => setMobileSurahOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition shrink-0"
              title="Browse all 114 Surahs"
            >
              <span>📖</span>
              <span className="font-semibold truncate max-w-[110px]">{currentSurah?.englishName || "Surahs"}</span>
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
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shadow-sm"
            >
              Quran
            </button>
            <button
              onClick={() => navigate('/hadith')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
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

      {/* ── Main Body Split: Surah Sidebar & Verses Reader ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* ── Desktop Left Sidebar: Surahs List ── */}
        {!readMode && (
          <aside className="hidden lg:flex w-80 shrink-0 border-r border-white/[0.06] bg-[#070b10] flex-col overflow-hidden">
            {renderSurahSidebarContent(false)}
          </aside>
        )}

        {/* ── Main View: Surah Header & Verses Stream ── */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
          
          {/* Surah Header Card */}
          <div className="bg-[#0b1017] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Surah {selectedSurahId}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">
                  {currentSurah?.revelationType} · {currentSurah?.numberOfAyahs || currentSurah?.verses?.length || 0} Verses
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-white tracking-tight">
                {currentSurah?.englishName || 'Al-Fatihah'}
              </h2>
              <p className="text-xs text-gray-400">
                Meaning: <span className="text-gray-200">{currentSurah?.englishNameTranslation}</span>
              </p>
            </div>

            {/* Arabic Surah Name & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
              <div className="font-arabic text-2xl sm:text-3xl text-emerald-400 shrink-0">
                {currentSurah?.name}
              </div>

              <div className="flex items-center gap-2">
                {/* Prev Surah Button */}
                <button
                  type="button"
                  onClick={handlePrevSurah}
                  disabled={selectedSurahId <= 1}
                  className="p-2 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                  title="Previous Surah"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Surah Button */}
                <button
                  type="button"
                  onClick={handleNextSurah}
                  disabled={selectedSurahId >= 114}
                  className="p-2 rounded-xl border border-white/[0.08] hover:border-emerald-500/40 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                  title="Next Surah"
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
                  title="Toggle Read Mode (focus on verses)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">{readMode ? 'Exit Read Mode' : 'Read Mode'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Centered Bismillah Calligraphy (except Surah At-Tawbah 9) */}
          {selectedSurahId !== 9 && (
            <div className="text-center py-4 sm:py-6">
              <div className="font-arabic text-xl sm:text-2xl md:text-3xl text-emerald-400 tracking-wide select-none drop-shadow-sm">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            </div>
          )}

          {/* Verses List */}
          {loadingVerses ? (
            <div className="py-20 text-center text-xs text-gray-500 space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <p>Loading authentic Quranic verses...</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {currentSurah?.verses?.map((verse) => {
                const isBookmarked = bookmarkedVerses[`${selectedSurahId}:${verse.number}`];
                const isPlaying = playingAudio === verse.number;
                const isInsightOpen = activeInsightVerse === verse.number;

                return (
                  <div
                    key={verse.number}
                    className={`rounded-2xl p-4 sm:p-6 transition-all ${
                      isInsightOpen
                        ? 'bg-[#0a121a] border border-emerald-500/35 shadow-xl'
                        : 'bg-[#0b1017]/70 border border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    {/* Arabic Text (Full width with diacritics & adjustable size) */}
                    <div
                      className="text-right font-arabic text-gray-100 leading-loose break-words mb-3 sm:mb-4 select-text"
                      style={{ fontSize: `${arabicFontSize}px`, lineHeight: 1.85 }}
                    >
                      {verse.text_ar}
                    </div>

                    {/* Verse Tools Bar */}
                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 pb-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        {/* Verse number pill */}
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isInsightOpen
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white/[0.06] text-gray-400'
                        }`}>
                          Verse {verse.number}
                        </div>

                        {/* Audio recitation button */}
                        {verse.audio && (
                          <button
                            onClick={() => handlePlayAudio(verse.number, verse.audio)}
                            className={`p-1.5 rounded-lg transition ${
                              isPlaying ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-400 hover:text-white'
                            }`}
                            title={isPlaying ? 'Pause' : 'Listen'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isPlaying ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              )}
                            </svg>
                          </button>
                        )}

                        {/* Bookmark */}
                        <button
                          onClick={() => toggleBookmark(verse.number)}
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

                      {/* Noor Insights Sparkle */}
                      <button
                        onClick={() => handleToggleInsight(verse.number)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition ${
                          isInsightOpen
                            ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 font-medium'
                            : 'text-gray-400 hover:text-emerald-300 hover:bg-white/[0.04]'
                        }`}
                        title="Scholarly Tafsir & Reflection"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                        <span className="hidden sm:inline">Tafsir & Insights</span>
                      </button>
                    </div>

                    {/* English Translation */}
                    {showTranslation && (
                      <div className="pt-2">
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                          {verse.text_en}
                        </p>
                      </div>
                    )}

                    {/* Collapsible Noor Insights / Tafsir card */}
                    {isInsightOpen && (
                      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                            </svg>
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                              Scholarly Tafsir & Reflection
                            </span>
                            {loadingTafsir[`${selectedSurahId}:${verse.number}`] ? (
                              <p className="text-xs text-emerald-400/80 leading-relaxed animate-pulse">
                                Retrieving authentic classical Tafsir and spiritual reflection...
                              </p>
                            ) : (
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                {tafsirCache[`${selectedSurahId}:${verse.number}`] ||
                                 "Click below to explore full classical commentaries and historical contexts."}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAskTafsirInChat(verse.number, verse.text_en)}
                          className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-emerald-400 hover:text-emerald-300 py-1.5 px-3 rounded-lg border border-emerald-500/40 hover:bg-emerald-500/10 transition"
                        >
                          Reflect in Chat
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Next / Prev Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/[0.06]">
            {selectedSurahId > 1 && (
              <div
                onClick={handlePrevSurah}
                className="p-4 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 cursor-pointer transition flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition">
                  ←
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                    Previous Surah
                  </span>
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                    Surah {selectedSurahId - 1}
                  </p>
                </div>
              </div>
            )}

            {selectedSurahId < 114 && (
              <div
                onClick={handleNextSurah}
                className="p-4 rounded-xl bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.06] hover:border-emerald-500/30 cursor-pointer transition flex items-center justify-between group sm:col-start-2"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                    Next Surah
                  </span>
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                    Surah {selectedSurahId + 1}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition">
                  →
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

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

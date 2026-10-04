import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyGuidance, toggleUserSunnah, getSessions } from '../api';

const formatRemainingTime = (rawMinutes) => {
  if (rawMinutes === undefined || rawMinutes === null || rawMinutes === "--") {
    return { hasHours: false, hours: 0, minutes: "--" };
  }
  const total = parseInt(rawMinutes, 10);
  if (isNaN(total)) {
    return { hasHours: false, hours: 0, minutes: rawMinutes };
  }
  if (total < 0) {
    return { hasHours: false, hours: 0, minutes: 0 };
  }
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return {
    hasHours: hours > 0,
    hours,
    minutes
  };
};

export default function Dashboard({ isDarkMode, user }) {
  const navigate = useNavigate();
  const [guidance, setGuidance] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        let savedLoc = null;
        try {
          savedLoc = JSON.parse(localStorage.getItem('user_detected_location'));
        } catch (_) {}

        const userLoc = user?.settings?.location;
        let guidePromise;
        if (userLoc) {
          guidePromise = getDailyGuidance(userLoc);
        } else if (savedLoc && savedLoc.lat && savedLoc.lon) {
          guidePromise = getDailyGuidance(savedLoc.city, savedLoc.country, savedLoc.lat, savedLoc.lon);
        } else {
          guidePromise = getDailyGuidance();
        }

        const [guideData, sessData] = await Promise.all([
          guidePromise,
          getSessions()
        ]);
        if (isMounted) {
          if (guideData) setGuidance(guideData);
          if (sessData) setSessions(sessData.slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [user]);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    const onSuccess = async (pos) => {
      try {
        let city = null;
        let country = null;
        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            city = revData.city || revData.locality || null;
            country = revData.countryName || null;
          }
        } catch (_) {}

        const data = await getDailyGuidance(city, country, pos.coords.latitude, pos.coords.longitude);
        if (data) {
          setGuidance(data);
          try {
            localStorage.setItem('user_detected_location', JSON.stringify({
              city: data.city || city,
              country: data.country || country,
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            }));
          } catch (_) {}
        }
      } catch (e) {
        console.error("Geolocation guidance error:", e);
      } finally {
        setDetectingLocation(false);
      }
    };
    const onError = async (err) => {
      console.warn("Browser GPS denied/failed, trying browser IP-geolocation:", err?.message);
      try {
        // Use browser-side IP lookup so the user's IP is used (not the server's)
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            const data = await getDailyGuidance(ipData.city, ipData.country_name, ipData.latitude, ipData.longitude);
            if (data) {
              setGuidance(data);
              try {
                localStorage.setItem('user_detected_location', JSON.stringify({
                  city: data.city || ipData.city,
                  country: data.country || ipData.country_name,
                  lat: ipData.latitude,
                  lon: ipData.longitude
                }));
              } catch (_) {}
              setDetectingLocation(false);
              return;
            }
          }
        }
      } catch (_) {}
      // Fallback: ask server to detect using client IP or timezone
      try {
        const data = await getDailyGuidance();
        if (data) setGuidance(data);
      } catch (e) {
        console.error("All location methods failed:", e);
      } finally {
        setDetectingLocation(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      await onError(null);
    }
  };


  const handleToggleSunnah = async (itemId, currentDone) => {
    if (!guidance) return;
    const newDone = !currentDone;
    // Optimistic UI update
    setGuidance(prev => {
      if (!prev?.daily_sunnah) return prev;
      const updatedItems = prev.daily_sunnah.items.map(it =>
        it.id === itemId ? { ...it, done: newDone } : it
      );
      const total = updatedItems.length;
      const done = updatedItems.filter(it => it.done).length;
      const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        ...prev,
        daily_sunnah: {
          ...prev.daily_sunnah,
          items: updatedItems,
          done,
          total,
          percentage
        }
      };
    });

    try {
      await toggleUserSunnah(itemId, newDone);
    } catch (e) {
      console.error("Failed to toggle sunnah:", e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const prayerIcons = {
    Fajr: (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 18v4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83" />
      </svg>
    ),
    Dhuhr: (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    Asr: (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
    Maghrib: (
      <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 18a5 5 0 0 0-10 0" />
        <path d="M12 9v4M12 2v2M4.22 10.22l1.42 1.42M1 18h22" />
      </svg>
    ),
    Isha: (
      <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    )
  };

  const prayers = guidance?.prayers || {
    location: user?.settings?.location?.toUpperCase() || "MAKKAH, SA",
    hijri_date: "AUTHENTIC CALENDAR",
    next_prayer: "Next Prayer",
    minutes_remaining: "--",
    prayers: [
      { name: "Fajr", time: "--:--" },
      { name: "Dhuhr", time: "--:--" },
      { name: "Asr", time: "--:--" },
      { name: "Maghrib", time: "--:--" },
      { name: "Isha", time: "--:--" }
    ]
  };

  const sunnah = guidance?.daily_sunnah || {
    total: 0,
    done: 0,
    percentage: 0,
    items: []
  };

  const verse = guidance?.verse_of_the_day || null;
  const hadith = guidance?.hadith_of_the_day || null;

  // Progress circle geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (sunnah.percentage || 0)) / 100;

  const displayName = user?.name ? user.name.split(' ')[0] : 'Seeker';

  return (
    <div className="flex-1 overflow-y-auto bg-[#070a0e] text-gray-100 min-h-screen selection:bg-emerald-500/30 selection:text-white"
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
        <div className="hidden lg:flex items-center p-1 rounded-xl border border-white/[0.08] bg-[#0c1219]">
          <button
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shadow-sm"
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

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-md w-full mx-8">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask about prayer times, duas, or fiqh..."
              className="w-full pl-10 pr-4 py-2 bg-[#0d131a] hover:bg-[#101822] focus:bg-[#101822] border border-white/[0.08] focus:border-emerald-500/50 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </form>

        {/* Action icons & Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full border border-emerald-500/50 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500/40 transition"
          >
            <img
              src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Seeker'}&backgroundColor=00b875`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="space-y-1.5">
          <p className="text-emerald-400 font-medium text-sm tracking-wide">
            Assalamu Alaikum, {displayName}
          </p>
          <h1 className="text-3xl md:text-5xl font-serif-luxury font-medium text-white tracking-tight leading-tight">
            Your daily guidance,<br />curated by Noor.
          </h1>
        </section>

        {/* ── 3-Column Top Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ── Card 1: Next Prayer & Timetable (Left Column) ── */}
          <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              {/* Location & Date */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-semibold tracking-wider uppercase min-w-0">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">{prayers.location} · {prayers.hijri_date}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold tracking-wider uppercase px-2 py-1 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 transition active:scale-95 disabled:opacity-50"
                  title="Detect and use current GPS / network location"
                >
                  <svg className={`w-3 h-3 ${detectingLocation ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                  <span>{detectingLocation ? "Detecting..." : "Use Current Location"}</span>
                </button>
              </div>

              {/* Next Prayer Big Countdown */}
              <div className="mb-6">
                <span className="text-xs text-gray-400 uppercase font-medium tracking-wider">Next prayer</span>
                <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                  <span className="text-3xl font-serif-luxury font-medium text-white">
                    {prayers.next_prayer}
                  </span>
                  {(() => {
                    const timeRemaining = formatRemainingTime(prayers.minutes_remaining);
                    return (
                      <div className="flex items-baseline gap-1.5 text-emerald-400">
                        {timeRemaining.hasHours ? (
                          <>
                            <span className="text-3xl font-semibold">{timeRemaining.hours}</span>
                            <span className="text-xs font-medium text-emerald-300 mr-1">
                              {timeRemaining.hours === 1 ? "hr" : "hrs"}
                            </span>
                            <span className="text-3xl font-semibold">{timeRemaining.minutes}</span>
                            <span className="text-xs font-medium text-emerald-300">
                              {timeRemaining.minutes === 1 ? "min" : "mins"}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl font-semibold">{timeRemaining.minutes}</span>
                            <span className="text-xs font-medium text-emerald-300">
                              {timeRemaining.minutes === 1 ? "min" : "mins"}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Prayers Timetable */}
              <div className="space-y-1.5">
                {prayers.prayers?.map((p) => {
                  const isCurrent = p.name === prayers.next_prayer;
                  return (
                    <div
                      key={p.name}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                          : 'text-gray-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {prayerIcons[p.name] || prayerIcons.Fajr}
                        <span className={`text-xs ${isCurrent ? 'font-semibold text-emerald-300' : 'font-medium'}`}>
                          {p.name}
                        </span>
                      </div>
                      <span className={`text-xs ${isCurrent ? 'font-bold text-white' : 'text-gray-400'}`}>
                        {p.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Column 2: Daily Sunnah & Hadith of the Day ── */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Daily Sunnah Card */}
            <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Daily Sunnah</h3>
                <span className="text-xs font-semibold text-emerald-400">
                  {sunnah.done} / {sunnah.total} done
                </span>
              </div>

              {/* Circular Progress Meter */}
              <div className="flex items-center justify-center my-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-white/[0.08]"
                      fill="transparent"
                    />
                    {/* Emerald active arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#00b875"
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-white leading-tight">
                      {sunnah.percentage}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
                      Today
                    </span>
                  </div>
                </div>
              </div>

              {/* Sunnah Checklist */}
              <div className="space-y-2 mt-4">
                {sunnah.items && sunnah.items.length > 0 ? (
                  sunnah.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSunnah(item.id, item.done)}
                      className="flex items-center gap-2.5 cursor-pointer group py-1 text-xs"
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        item.done
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/20 group-hover:border-white/40'
                      }`}>
                        {item.done && (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`transition ${
                        item.done ? 'text-gray-400 line-through' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-xs text-gray-500 animate-pulse">
                    Tracking daily prophetic practices...
                  </div>
                )}
              </div>
            </div>

            {/* Hadith of the Day Card */}
            <div className="bg-[#0b1017] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between text-gray-400 text-[10px] font-semibold tracking-wider uppercase mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9" />
                    </svg>
                    <span>Hadith of the Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hadith?.date && (
                      <span className="text-[10px] text-gray-400 font-normal tracking-normal">{hadith.date}</span>
                    )}
                    <span className="text-[10px] font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Sahih</span>
                  </div>
                </div>
                {hadith ? (
                  <p className="text-xs text-gray-200 leading-relaxed italic mb-4">
                    "{hadith.text}"
                  </p>
                ) : (
                  <div className="py-3 text-xs text-gray-500 animate-pulse">
                    Retrieving authentic Hadith from Sahih Al-Bukhari...
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400">
                <span>{hadith?.source || "Authentic Hadith"}</span>
                <button
                  type="button"
                  onClick={() => navigate('/hadith')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Explore 97 Books</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Column 3: Verse of the Day & Recent Sessions ── */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Verse of the Day Card */}
            <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between text-gray-400 text-[10px] font-semibold tracking-wider uppercase mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span>Verse of the Day</span>
                </div>
                {verse?.date && (
                  <span className="text-[10px] text-gray-400 font-normal tracking-normal">{verse.date}</span>
                )}
              </div>

              {verse ? (
                <>
                  {/* Calligraphy Verse */}
                  <div className="text-right font-arabic text-xl md:text-2xl text-emerald-400 leading-loose py-2 mb-3">
                    {verse.arabic}
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed italic mb-4">
                    "{verse.translation}"
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] text-[11px] text-gray-400">
                    {verse.surah} · {verse.ayah}
                  </div>
                </>
              ) : (
                <div className="py-4 text-xs text-gray-500 animate-pulse">
                  Loading authentic Quranic verse...
                </div>
              )}
            </div>

            {/* Recent with Noor Card */}
            <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-white">Recent with Noor</h3>
                  <button
                    onClick={() => navigate('/chat')}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.length > 0 ? (
                    sessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => navigate(`/chat?session=${sess.id}`)}
                        className="group cursor-pointer py-1"
                      >
                        <p className="text-xs text-gray-200 group-hover:text-emerald-300 font-medium truncate transition">
                          {sess.title || "Spiritual reflection"}
                        </p>
                        <span className="text-[10px] text-gray-500">
                          {sess.updated_at ? new Date(sess.updated_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 text-xs text-gray-500">
                      No recent inquiries yet. Start your first conversation with Noor.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Quick Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Card A: Ask Noor */}
          <div
            onClick={() => navigate('/chat')}
            className="group cursor-pointer bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
              Ask Noor
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Start a new conversation
            </p>
          </div>

          {/* Card B: Read Quran */}
          <div
            onClick={() => navigate('/quran')}
            className="group cursor-pointer bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
              Read Quran
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Explore 114 Surahs with Tafsir
            </p>
          </div>

          {/* Card C: Daily Duas */}
          <div
            onClick={() => navigate('/duas')}
            className="group cursor-pointer bg-[#0b1017] hover:bg-[#0e1620] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
              Daily Duas
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Morning & evening set
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

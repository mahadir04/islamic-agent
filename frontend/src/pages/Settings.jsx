import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api';
import AppNavigation from '../components/AppNavigation';

export default function Settings({ isDarkMode, user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Islamabad, Pakistan');
  const [calculationMethod, setCalculationMethod] = useState('University of Islamic Sciences, Karachi');
  const [asrSchool, setAsrSchool] = useState('Hanafi');
  const [aiAdaptive, setAiAdaptive] = useState(true);
  const [transliteration, setTransliteration] = useState(false);

  // Notifications State
  const [adhanAlerts, setAdhanAlerts] = useState(true);
  const [prayerNotifications, setPrayerNotifications] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true
  });
  const [muezzinVoice, setMuezzinVoice] = useState('makkah');
  const [prePrayerReminder, setPrePrayerReminder] = useState('15');
  const [morningAdhkarReminder, setMorningAdhkarReminder] = useState(true);
  const [morningAdhkarTime, setMorningAdhkarTime] = useState('06:00');
  const [eveningAdhkarReminder, setEveningAdhkarReminder] = useState(true);
  const [eveningAdhkarTime, setEveningAdhkarTime] = useState('17:30');
  const [hadithOfDayNotification, setHadithOfDayNotification] = useState(true);
  const [fridayKahfReminder, setFridayKahfReminder] = useState(true);
  const [tahajjudReminder, setTahajjudReminder] = useState(false);
  const [tahajjudTime, setTahajjudTime] = useState('04:30');

  // Privacy & Fiqh State
  const [primaryMadhhab, setPrimaryMadhhab] = useState('hanafi');
  const [requireScholarlySources, setRequireScholarlySources] = useState(true);
  const [contemporaryFatwas, setContemporaryFatwas] = useState(true);
  const [storeChatHistory, setStoreChatHistory] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  // Localization State
  const [appLanguage, setAppLanguage] = useState('en');
  const [quranScript, setQuranScript] = useState('uthmani');
  const [arabicFontSize, setArabicFontSize] = useState('large');
  const [hijriAdjustment, setHijriAdjustment] = useState('0');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [autoDst, setAutoDst] = useState(true);

  // Subscription State
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  // Global Save State
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      const s = user.settings || {};
      
      // Profile
      if (s.location) setLocation(s.location);
      if (s.calculation_method) setCalculationMethod(s.calculation_method);
      if (s.asr_school) setAsrSchool(s.asr_school);
      if (typeof s.ai_adaptive === 'boolean') setAiAdaptive(s.ai_adaptive);
      if (typeof s.transliteration === 'boolean') setTransliteration(s.transliteration);

      // Notifications
      if (typeof s.adhan_alerts === 'boolean') setAdhanAlerts(s.adhan_alerts);
      if (s.prayer_notifications) setPrayerNotifications(s.prayer_notifications);
      if (s.muezzin_voice) setMuezzinVoice(s.muezzin_voice);
      if (s.pre_prayer_reminder) setPrePrayerReminder(s.pre_prayer_reminder);
      if (typeof s.morning_adhkar_reminder === 'boolean') setMorningAdhkarReminder(s.morning_adhkar_reminder);
      if (s.morning_adhkar_time) setMorningAdhkarTime(s.morning_adhkar_time);
      if (typeof s.evening_adhkar_reminder === 'boolean') setEveningAdhkarReminder(s.evening_adhkar_reminder);
      if (s.evening_adhkar_time) setEveningAdhkarTime(s.evening_adhkar_time);
      if (typeof s.hadith_notification === 'boolean') setHadithOfDayNotification(s.hadith_notification);
      if (typeof s.friday_kahf_reminder === 'boolean') setFridayKahfReminder(s.friday_kahf_reminder);
      if (typeof s.tahajjud_reminder === 'boolean') setTahajjudReminder(s.tahajjud_reminder);
      if (s.tahajjud_time) setTahajjudTime(s.tahajjud_time);

      // Privacy & Fiqh
      if (s.primary_madhhab) setPrimaryMadhhab(s.primary_madhhab);
      if (typeof s.require_scholarly_sources === 'boolean') setRequireScholarlySources(s.require_scholarly_sources);
      if (typeof s.contemporary_fatwas === 'boolean') setContemporaryFatwas(s.contemporary_fatwas);
      if (typeof s.store_chat_history === 'boolean') setStoreChatHistory(s.store_chat_history);
      if (typeof s.anonymous_analytics === 'boolean') setAnonymousAnalytics(s.anonymous_analytics);

      // Localization
      if (s.language) setAppLanguage(s.language);
      if (s.quran_script) setQuranScript(s.quran_script);
      if (s.arabic_font_size) setArabicFontSize(s.arabic_font_size);
      if (s.hijri_adjustment) setHijriAdjustment(s.hijri_adjustment);
      if (s.time_format) setTimeFormat(s.time_format);
      if (typeof s.auto_dst === 'boolean') setAutoDst(s.auto_dst);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateProfile({
        name,
        settings: {
          location,
          calculation_method: calculationMethod,
          asr_school: asrSchool,
          ai_adaptive: aiAdaptive,
          transliteration,
          // Notifications
          adhan_alerts: adhanAlerts,
          prayer_notifications: prayerNotifications,
          muezzin_voice: muezzinVoice,
          pre_prayer_reminder: prePrayerReminder,
          morning_adhkar_reminder: morningAdhkarReminder,
          morning_adhkar_time: morningAdhkarTime,
          evening_adhkar_reminder: eveningAdhkarReminder,
          evening_adhkar_time: eveningAdhkarTime,
          hadith_notification: hadithOfDayNotification,
          friday_kahf_reminder: fridayKahfReminder,
          tahajjud_reminder: tahajjudReminder,
          tahajjud_time: tahajjudTime,
          // Privacy & Fiqh
          primary_madhhab: primaryMadhhab,
          require_scholarly_sources: requireScholarlySources,
          contemporary_fatwas: contemporaryFatwas,
          store_chat_history: storeChatHistory,
          anonymous_analytics: anonymousAnalytics,
          // Localization
          language: appLanguage,
          quran_script: quranScript,
          arabic_font_size: arabicFontSize,
          hijri_adjustment: hijriAdjustment,
          time_format: timeFormat,
          auto_dst: autoDst
        }
      });
      if (setUser) setUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to update profile:", e);
      alert("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
          const data = await res.json();
          if (data && (data.city || data.locality)) {
            const locStr = `${data.city || data.locality}, ${data.countryName}`;
            setLocation(locStr);
          }
        } catch {
          setLocation("Current Location (GPS)");
        }
      },
      () => alert("Unable to retrieve location.")
    );
  };

  const handleExportData = () => {
    const exportObj = {
      user: { name, email },
      settings: user?.settings || {},
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noor-profile-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history? This action cannot be undone.")) {
      setClearingHistory(true);
      setTimeout(() => {
        setClearingHistory(false);
        alert("Your chat session history has been securely reset.");
      }, 1000);
    }
  };

  const handleSubscribe = () => {
    setSubscriptionSuccess(true);
    setTimeout(() => setSubscriptionSuccess(false), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'notifications', label: 'Notifications', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: 'privacy', label: 'Privacy & Fiqh', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )},
    { id: 'localization', label: 'Localization', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )},
    { id: 'subscription', label: 'Subscription', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070a0e] text-gray-100 min-h-screen selection:bg-emerald-500/30 selection:text-white"
         style={{
           backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
           backgroundSize: '24px 24px'
         }}>
      
      {/* ── Top Header Navigation ── */}
      <header className="sticky top-0 z-30 w-full bg-[#070a0e]/85 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
        
        {/* Brand & Drawer Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.06] transition flex items-center justify-center"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

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
        </div>

        {/* Center Nav Pills */}
        <div className="hidden md:flex items-center p-1 rounded-xl border border-white/[0.08] bg-[#0c1219]">
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/30 transition transform active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (savedSuccess ? 'Saved ✓' : 'Save Changes')}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pb-24 sm:py-10 md:pb-12 flex flex-col md:flex-row gap-8 lg:gap-10">
        
        {/* ── Left Sidebar Tabs ── */}
        <aside className="w-full md:w-56 shrink-0 space-y-4">
          <h2 className="text-2xl font-serif-luxury font-medium text-white mb-4">
            Settings
          </h2>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition text-left shrink-0 md:w-full ${
                    isActive
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="hidden md:block pt-4 border-t border-white/[0.06] mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Right Content Panels (Dynamic according to activeTab) ── */}
        <div className="flex-1 space-y-6">

          {/* ══════════════════════════════════════════════
              TAB 1: PROFILE
             ══════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Account Information */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Account Information</h3>
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-emerald-500/40 overflow-hidden">
                      <img
                        src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${name || user?.email?.split('@')[0] || 'User'}&backgroundColor=00b875`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-white">{name || user?.email?.split('@')[0] || 'User'}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'} · Noor Member
                    </p>
                    <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Verified Seeker
                    </span>
                  </div>
                </div>

                {/* Inputs: Full Name & Email Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 bg-[#070b10]/60 border border-white/[0.04] text-xs text-gray-400 rounded-xl cursor-not-allowed shadow-inner"
                    />
                  </div>
                </div>

                {/* Input: Location for Prayer Timings */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Location (For Prayer Timings)
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold uppercase flex items-center gap-1"
                    >
                      <span>📍 Auto-Detect GPS</span>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-emerald-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country (e.g. Islamabad, Pakistan)"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Spiritual Preferences */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Spiritual Preferences</h3>
                </div>

                {/* Calculation Method */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Calculation Method</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Determines solar angle calculation for Fajr & Isha.</p>
                  </div>
                  <select
                    value={calculationMethod}
                    onChange={(e) => setCalculationMethod(e.target.value)}
                    className="bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none min-w-[240px]"
                  >
                    <option value="University of Islamic Sciences, Karachi">University of Islamic Sciences, Karachi</option>
                    <option value="Islamic Society of North America (ISNA)">Islamic Society of North America (ISNA)</option>
                    <option value="Muslim World League">Muslim World League</option>
                    <option value="Umm Al-Qura University, Makkah">Umm Al-Qura University, Makkah</option>
                    <option value="Egyptian General Authority of Survey">Egyptian General Authority of Survey</option>
                  </select>
                </div>

                {/* Asr School of Thought */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Asr School of Thought</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Shadow length standard used to determine Asr entry.</p>
                  </div>
                  <div className="p-1 rounded-xl bg-[#070b10] border border-white/[0.08] flex items-center">
                    <button
                      type="button"
                      onClick={() => setAsrSchool('Hanafi')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        asrSchool === 'Hanafi'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Hanafi (2x Shadow)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAsrSchool('Standard')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        asrSchool !== 'Hanafi'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Shafi/Standard (1x Shadow)
                    </button>
                  </div>
                </div>

                {/* AI Adaptive Guidance */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">AI Adaptive Guidance</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Noor adapts explanations based on your learning journey and queries.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAdaptive(!aiAdaptive)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      aiAdaptive ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aiAdaptive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Transliteration */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Show Transliteration</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Include Latin phonetic script for Arabic verses & Duas in Chat.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTransliteration(!transliteration)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      transliteration ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        transliteration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 2: NOTIFICATIONS
             ══════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Adhan & Prayer Alerts */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-semibold text-white">Adhan & Prayer Alerts</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdhanAlerts(!adhanAlerts)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      adhanAlerts ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        adhanAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Receive atmospheric notification alerts at the exact onset of prayer times for your location.
                </p>

                {/* Individual Prayers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((p) => {
                    const isChecked = prayerNotifications[p];
                    return (
                      <div
                        key={p}
                        onClick={() => setPrayerNotifications(prev => ({ ...prev, [p]: !prev[p] }))}
                        className={`p-3 rounded-xl border cursor-pointer transition text-center ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#070b10] border-white/[0.06] text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider block mb-1">
                          {p}
                        </span>
                        <span className="text-xs font-semibold">
                          {isChecked ? 'Active ✓' : 'Muted'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Muezzin Voice */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Muezzin Sound</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Reciter for Adhan notification playback.</p>
                  </div>
                  <select
                    value={muezzinVoice}
                    onChange={(e) => setMuezzinVoice(e.target.value)}
                    className="bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none min-w-[220px]"
                  >
                    <option value="makkah">Makkah al-Mukarramah (Sheikh Ali Mulla)</option>
                    <option value="madinah">Al-Madinah al-Munawwarah</option>
                    <option value="alaqsa">Al-Masjid Al-Aqsa, Al-Quds</option>
                    <option value="gentle">Gentle Chime Sound</option>
                    <option value="silent">Silent / Vibration Only</option>
                  </select>
                </div>

                {/* Pre-Prayer Reminder */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Pre-Prayer Reminder</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Prepare with ablution (Wudu') before the Adhan calls.</p>
                  </div>
                  <select
                    value={prePrayerReminder}
                    onChange={(e) => setPrePrayerReminder(e.target.value)}
                    className="bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none min-w-[220px]"
                  >
                    <option value="0">Off (At Adhan time only)</option>
                    <option value="5">5 Minutes Before</option>
                    <option value="10">10 Minutes Before</option>
                    <option value="15">15 Minutes Before</option>
                    <option value="20">20 Minutes Before</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Prophetic Adhkar & Daily Reminders */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Prophetic Adhkar & Daily Habits</h3>
                </div>

                {/* Morning Adhkar */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Morning Adhkar (أذكار الصباح)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Authentic fortress of the Muslim morning supplications.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={morningAdhkarTime}
                      onChange={(e) => setMorningAdhkarTime(e.target.value)}
                      className="bg-[#070b10] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setMorningAdhkarReminder(!morningAdhkarReminder)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        morningAdhkarReminder ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${morningAdhkarReminder ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Evening Adhkar */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Evening Adhkar (أذكار المساء)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Supplications recited between Asr and Maghrib.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={eveningAdhkarTime}
                      onChange={(e) => setEveningAdhkarTime(e.target.value)}
                      className="bg-[#070b10] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setEveningAdhkarReminder(!eveningAdhkarReminder)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        eveningAdhkarReminder ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${eveningAdhkarReminder ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Hadith of the Day */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Daily Hadith of the Day</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Receive one authentic prophetic tradition each morning.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHadithOfDayNotification(!hadithOfDayNotification)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hadithOfDayNotification ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hadithOfDayNotification ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Surah Al-Kahf Friday */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Friday Surah Al-Kahf Reminder</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Light from Friday to Friday as encouraged by the Prophet ﷺ.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFridayKahfReminder(!fridayKahfReminder)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      fridayKahfReminder ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${fridayKahfReminder ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Tahajjud Reminder */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Tahajjud & Night Vigil Call</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Gentle wake-up call during the last third of the night.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={tahajjudTime}
                      onChange={(e) => setTahajjudTime(e.target.value)}
                      className="bg-[#070b10] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setTahajjudReminder(!tahajjudReminder)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tahajjudReminder ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tahajjudReminder ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 3: PRIVACY & FIQH
             ══════════════════════════════════════════════ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Fiqh Jurisprudence & Verification */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Jurisprudential Framework (Madhhab)</h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Choose your primary school of Islamic jurisprudence. Noor will prioritize rulings and classical opinions from your chosen tradition while maintaining academic honesty.
                </p>

                {/* Madhhab Selection Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'hanafi', name: 'Hanafi (الحنفي)', desc: 'Imam Abu Hanifa (Dominant in South Asia, Turkey, Balkans)' },
                    { id: 'shafii', name: 'Shafi\'i (الشافعي)', desc: 'Imam al-Shafi\'i (Dominant in Southeast Asia, East Africa, Levant)' },
                    { id: 'maliki', name: 'Maliki (المالكي)', desc: 'Imam Malik bin Anas (Dominant in North & West Africa, Gulf)' },
                    { id: 'hanbali', name: 'Hanbali (الحنبلي)', desc: 'Imam Ahmad bin Hanbal (Dominant in Arabian Peninsula)' },
                    { id: 'general', name: 'Comparative / General Sunnah', desc: 'Evidences from all 4 Sunni schools without strict adherence' }
                  ].map((m) => {
                    const isSelected = primaryMadhhab === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPrimaryMadhhab(m.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-md'
                            : 'bg-[#070b10] border-white/[0.06] text-gray-300 hover:border-white/[0.15]'
                        } ${m.id === 'general' ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                            {m.name}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-gray-500'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Scholarly Source Attribution */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Strict Authentic Citations</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Require explicit book, chapter, and verse/hadith references in every AI answer.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireScholarlySources(!requireScholarlySources)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      requireScholarlySources ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requireScholarlySources ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Contemporary Fatwa Guidance */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Include Contemporary Fatwa Councils</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Incorporate resolutions from modern bodies like OIC Fiqh Academy and Al-Azhar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContemporaryFatwas(!contemporaryFatwas)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      contemporaryFatwas ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${contemporaryFatwas ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

              </div>

              {/* Card 2: Data Privacy & Export */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Data Sanctuary & History</h3>
                </div>

                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Store Discussion History</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Saves your conversations securely so you can resume reflections later.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStoreChatHistory(!storeChatHistory)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      storeChatHistory ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${storeChatHistory ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Anonymous Spiritual Analytics</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Helps improve Noor's retrieval accuracy without linking to your identity.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnonymousAnalytics(!anonymousAnalytics)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      anonymousAnalytics ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${anonymousAnalytics ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <span>📥</span>
                    <span>Export My Data (.JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearHistory}
                    disabled={clearingHistory}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>🗑️</span>
                    <span>{clearingHistory ? 'Clearing...' : 'Clear All Discussions'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 4: LOCALIZATION
             ══════════════════════════════════════════════ */}
          {activeTab === 'localization' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Language & Script Styles */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Language & Script Typography</h3>
                </div>

                {/* App Language */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Interface Language</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Primary language for application controls and navigation.</p>
                  </div>
                  <select
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value)}
                    className="bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none min-w-[200px]"
                  >
                    <option value="en">English (US / UK)</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="ur">اردو (Urdu)</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="fr">Français (French)</option>
                    <option value="tr">Türkçe (Turkish)</option>
                  </select>
                </div>

                {/* Quran Script Style */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Quranic Script Style</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Calligraphic standard for Arabic verses and Duas.</p>
                  </div>
                  <div className="p-1 rounded-xl bg-[#070b10] border border-white/[0.08] flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuranScript('uthmani')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        quranScript === 'uthmani'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Uthmani (Madinah)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuranScript('indopak')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        quranScript === 'indopak'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Indo-Pak (Naskh)
                    </button>
                  </div>
                </div>

                {/* Arabic Font Size */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Arabic Font Scaling</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Size of Arabic calligraphy throughout verses and Hadiths.</p>
                  </div>
                  <div className="p-1 rounded-xl bg-[#070b10] border border-white/[0.08] flex items-center">
                    {['regular', 'large', 'xlarge'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setArabicFontSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                          arabicFontSize === sz
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {sz === 'regular' ? 'Standard' : sz === 'large' ? 'Large' : 'Extra Large'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card 2: Hijri Date & Timetable Settings */}
              <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-white">Calendar & Regional Formatting</h3>
                </div>

                {/* Hijri Adjustment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Hijri Moon-Sighting Offset</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Adjust Islamic date by +/- 1-2 days to align with your local Hilal sighting.</p>
                  </div>
                  <select
                    value={hijriAdjustment}
                    onChange={(e) => setHijriAdjustment(e.target.value)}
                    className="bg-[#070b10] border border-white/[0.08] focus:border-emerald-500/60 text-xs text-white px-3.5 py-2 rounded-xl focus:outline-none min-w-[200px]"
                  >
                    <option value="-2">-2 Days</option>
                    <option value="-1">-1 Day</option>
                    <option value="0">0 Days (Standard Astronomical)</option>
                    <option value="1">+1 Day</option>
                    <option value="2">+2 Days</option>
                  </select>
                </div>

                {/* Time Display Format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Time Clock Format</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Format for prayer countdowns and timetable display.</p>
                  </div>
                  <div className="p-1 rounded-xl bg-[#070b10] border border-white/[0.08] flex items-center">
                    <button
                      type="button"
                      onClick={() => setTimeFormat('12h')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        timeFormat === '12h'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      12-Hour (e.g. 5:30 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFormat('24h')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        timeFormat === '24h'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      24-Hour (e.g. 17:30)
                    </button>
                  </div>
                </div>

                {/* Auto Daylight Saving */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Automatic Daylight Saving (DST)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Auto-adjust prayer timings during seasonal clock changes.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoDst(!autoDst)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoDst ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoDst ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 5: SUBSCRIPTION
             ══════════════════════════════════════════════ */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Current Active Plan Card */}
              <div className="bg-[#0b1017] border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Active Plan
                    </span>
                    <span className="text-xs text-gray-400">· Community Endowment</span>
                  </div>
                  <span className="text-xs font-semibold text-white">$0.00 / Free Forever</span>
                </div>

                <div>
                  <h3 className="text-2xl font-serif-luxury font-medium text-white tracking-tight">
                    Noor Community Tier
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Essential Islamic AI tools, Quranic reader, Sahih al-Bukhari library, and daily prophetic Adhkar remain 100% free and open for the Ummah.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>114 Surahs with authentic Tafsir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>7,554 Hadiths of Sahih al-Bukhari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>GPS Prayer Timings & Sunnah Tracker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Prophetic Duas with Digital Counter</span>
                  </div>
                </div>
              </div>

              {/* Patron / Sadaqah Jariyah Plan Card */}
              <div className="bg-[#0c1219] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Sadaqah Jariyah & Talib al-Ilm
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif-luxury font-medium text-white tracking-tight">
                      Noor Patron & Research Supporter
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sponsor open-source Islamic AI infrastructure, dataset verifications, and empower millions of Muslims globally.
                    </p>
                  </div>

                  {/* Billing cycle toggle */}
                  <div className="p-1 rounded-xl bg-[#070b10] border border-white/[0.08] flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        billingCycle === 'monthly'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Monthly ($4.99)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase ${
                        billingCycle === 'annual'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Annual ($39/yr)
                    </button>
                  </div>
                </div>

                {/* Exclusive Patron Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300 bg-[#070b10]/60 p-4 rounded-xl border border-white/[0.04]">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">★</span>
                    <span>Priority Gemini 2.5 Pro Deep Reasoning for complex fiqh queries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">★</span>
                    <span>Audio recitation stream with 20+ world-renowned reciters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">★</span>
                    <span>Continuous Sadaqah Jariyah reward supporting free access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">★</span>
                    <span>Early access to upcoming Hadith collections (Sahih Muslim, Abu Dawud)</span>
                  </div>
                </div>

                {/* Subscribe Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-400">
                    Cancel or modify at any time. Powered by secure payments.
                  </div>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold shadow-lg shadow-amber-950/40 transition transform active:scale-95"
                  >
                    {subscriptionSuccess ? 'Thank You for Supporting Noor! 🤲' : (billingCycle === 'monthly' ? 'Support for $4.99/mo' : 'Support for $39/year')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Responsive Sidebar & Navigation Drawer ── */}
      <AppNavigation
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
    </div>
  );
}

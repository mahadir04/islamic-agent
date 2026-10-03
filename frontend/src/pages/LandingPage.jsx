import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    icon: '📖',
    title: 'Authentic Sources',
    desc: 'Rooted in the Quran, Sunnah, and verified scholarly works.',
    color: 'from-emerald-500/10 to-green-600/5',
    border: 'border-emerald-500/15',
  },
  {
    icon: '🛡️',
    title: 'Private & Secure',
    desc: 'Your conversations are private, secured with Google OAuth.',
    color: 'from-blue-500/10 to-cyan-600/5',
    border: 'border-blue-500/15',
  },
  {
    icon: '⚡',
    title: 'Instant Insights',
    desc: 'Immediate answers on Fiqh, Tafsir, Seerah, and daily guidance.',
    color: 'from-amber-500/10 to-orange-600/5',
    border: 'border-amber-500/15',
  },
];

export default function LandingPage({ isDarkMode }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    } ${
      isDarkMode ? 'bg-[#0c0c10] text-gray-100' : 'bg-[#f5f5f7] text-gray-900'
    }`}>

      {/* ── Nav ── */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center animate-slide-down">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isDarkMode
              ? 'bg-emerald-500/15 border border-emerald-500/20 shadow-inner'
              : 'bg-white border border-emerald-200/60 shadow-sm'
            }
          `}>
            <span className="text-xl">🕌</span>
          </div>
          <span className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Islamic AI
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className={`
            px-5 py-2 rounded-xl text-sm font-semibold
            transition-all duration-200 hover:scale-105 active:scale-95
            ${isDarkMode
              ? 'bg-white/8 border border-white/10 text-gray-200 hover:bg-white/12'
              : 'bg-white border border-gray-200/60 text-gray-700 hover:bg-gray-50 shadow-sm'
            }
          `}
        >
          Sign in →
        </button>
      </nav>

      {/* ── Hero ── */}
      <main className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">

        {/* Badge */}
        <div className={`
          inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8
          border animate-fade-in
          ${isDarkMode
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
          }
        `}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Powered by Gemini · Authentic Islamic Knowledge
        </div>

        {/* Headline */}
        <h1 className={`
          text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6
          animate-fade-in delay-75
        `}>
          Your Dedicated<br />
          <span className="gradient-text">Islamic AI Companion</span>
        </h1>

        {/* Subtitle */}
        <p className={`
          text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed
          animate-fade-in delay-150
          ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          A modern, private AI assistant designed to help you explore Quranic insights,
          Hadith, Fiqh rulings, and the Seerah of the Prophet ﷺ.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in delay-225">
          <button
            onClick={() => navigate('/login')}
            className="
              px-8 py-3.5 rounded-xl text-base font-semibold
              bg-gradient-to-r from-emerald-500 to-green-600
              text-white hover:from-emerald-400 hover:to-green-500
              transition-all duration-200 hover:scale-105 active:scale-95
              shadow-xl shadow-emerald-900/30 btn-glow
            "
          >
            Get Started — It's Free
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className={`
              px-8 py-3.5 rounded-xl text-base font-medium
              border transition-all duration-200 hover:scale-105 active:scale-95
              ${isDarkMode
                ? 'border-white/10 text-gray-300 hover:bg-white/5'
                : 'border-gray-200 text-gray-600 hover:bg-white shadow-sm'
              }
            `}
          >
            Learn more ↓
          </button>
        </div>

        {/* Mockup preview card */}
        <div className={`
          mt-16 md:mt-20 mx-auto max-w-2xl rounded-2xl border p-5 text-left
          animate-fade-in delay-400
          ${isDarkMode
            ? 'bg-[#13131a] border-white/[0.06] shadow-2xl shadow-black/60'
            : 'bg-white border-gray-100/80 shadow-xl shadow-gray-200/60'
          }
        `}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <div className={`flex-1 mx-2 h-5 rounded-md text-[10px] flex items-center px-2 ${
              isDarkMode ? 'bg-white/4 text-gray-600' : 'bg-gray-50 text-gray-300'
            }`}>
              islamic-ai.app/chat
            </div>
          </div>

          {/* Fake chat messages */}
          {[
            { role: 'user', text: 'What are the conditions for Zakat to become obligatory?' },
            { role: 'bot', text: '**Nisab** (minimum amount), **Hawl** (one lunar year), and ownership of the wealth. The nisab is equivalent to 85 grams of gold or 595 grams of silver.' },
          ].map((m, i) => (
            <div key={i} className={`flex gap-2.5 mb-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'bot' && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                  isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                }`}>🕌</div>
              )}
              <div className={`
                max-w-[78%] px-3.5 py-2.5 rounded-xl text-sm
                ${m.role === 'user'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-sm'
                  : isDarkMode
                    ? 'bg-[#1c1c26] border border-white/[0.07] text-gray-300 rounded-bl-sm'
                    : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-sm'
                }
              `}>
                <span dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
              </div>
              {m.role === 'user' && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  isDarkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-600 text-white'
                }`}>You</div>
              )}
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`
                p-6 rounded-2xl border text-left
                hover-lift animate-fade-in
                bg-gradient-to-br ${f.color} ${f.border}
                ${isDarkMode ? 'border-opacity-100' : 'border-opacity-80 shadow-sm'}
              `}
              style={{ animationDelay: `${500 + i * 100}ms` }}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className={`text-base font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {f.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={`border-t py-8 ${isDarkMode ? 'border-white/[0.05]' : 'border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕌</span>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Islamic AI Assistant
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2026 Islamic AI. For educational purposes only. Always verify with a scholar.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function LandingPage({ isDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#0f0f11] text-gray-100' : 'bg-[#fafafa] text-gray-800'
    }`}>
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            isDarkMode ? 'bg-gray-800 border border-white/5 text-green-400' : 'bg-white border border-gray-200 text-green-600'
          }`}>
            <span className="text-xl">🕌</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Islamic AI</span>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white text-black hover:bg-gray-200' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Your Dedicated <br />
            <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Islamic AI Companion</span>
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto mb-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            A modern, private, and authentic AI assistant designed to help you with Quranic insights, Hadith, and Islamic knowledge.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl ${
                isDarkMode 
                  ? 'bg-white text-black hover:shadow-white/10' 
                  : 'bg-black text-white hover:shadow-black/20'
              }`}
            >
              Get Started for Free
            </button>
            <button
              className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border ${
                isDarkMode 
                  ? 'border-white/10 text-gray-300 hover:bg-white/5' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-4xl mb-6">📖</div>
            <h3 className="text-xl font-semibold mb-4">Authentic Sources</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Answers rooted in the Quran, Sunnah, and recognized scholarly works.
            </p>
          </div>
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-4xl mb-6">🛡️</div>
            <h3 className="text-xl font-semibold mb-4">Private & Secure</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Your conversations are private and secured with industry-standard encryption.
            </p>
          </div>
          <div className={`p-8 rounded-3xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#1a1a1a]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="text-4xl mb-6">⚡</div>
            <h3 className="text-xl font-semibold mb-4">Instant Insights</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Get immediate answers to your daily questions about Fiqh, Tafsir, and beyond.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 ${
        isDarkMode ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-lg">🕌</span>
            <span className="font-medium">Islamic AI</span>
          </div>
          <div className="text-sm">
            © 2026 Islamic AI Assistant. For educational purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}

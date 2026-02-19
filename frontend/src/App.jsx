import { useState, useEffect } from 'react';
import Chat from "./Chat";
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
    }`}>
      
      {/* Mobile Header */}
      {isMobile && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${
          isDarkMode ? 'bg-gray-900/95 backdrop-blur-lg' : 'bg-white/95 backdrop-blur-lg'
        } border-b ${isDarkMode ? 'border-gray-800' : 'border-green-100'}`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">🕌</span>
              </div>
              <h1 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Islamic AI
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 text-yellow-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-green-100'}`}>
              <div className="space-y-2">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Answers based on authentic Islamic sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Prayer", "Fasting", "Zakat", "Hajj"].map((item) => (
                    <button
                      key={item}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isDarkMode
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🕌</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Islamic AI Assistant
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Authentic Islamic knowledge at your fingertips
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className={`container mx-auto px-4 py-4 ${isMobile ? 'mt-16' : 'py-6'}`}>
        <div className={`max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <Chat isDarkMode={isDarkMode} isMobile={isMobile} />
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Based on Quran, Hadith, and classical Islamic sources
          </p>
        </div>
      </div>
    </div>
  );
}
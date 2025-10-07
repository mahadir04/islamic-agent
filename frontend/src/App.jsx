import { useState } from 'react';
import Chat from "./Chat";
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="w-10"></div> {/* Spacer for balance */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">🕌</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Islamic AI Assistant
                </h1>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Ask questions about Islam based on authentic sources from Quran, Hadith, and classical scholarship
            </p>
          </div>

          {/* Main Chat Container */}
          <div className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <Chat isDarkMode={isDarkMode} />
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Answers based on authentic Islamic sources • May Allah guide us to beneficial knowledge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
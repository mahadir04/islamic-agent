import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUserProfile, getUserStats, updateProfile, uploadProfilePicture } from '../api';

const TABS = ['profile', 'statistics'];

export default function Profile({ isDarkMode, onClose, onUpdate }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', preferences: {} });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true); setError(null);
    try {
      const [pd, sd] = await Promise.all([getUserProfile(), getUserStats()]);
      setProfile(pd); setStats(sd);
      setFormData({ name: pd.name, preferences: pd.preferences || {} });
    } catch { setError('Failed to load profile. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const url = await uploadProfilePicture(file);
      setProfile({ ...profile, picture: url });
      if (onUpdate) onUpdate();
    } catch { setError('Failed to upload picture.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated); setEditing(false);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
      if (onUpdate) onUpdate();
    } catch { setError('Failed to update profile.'); }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const avatarSrc = profile?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=10b981&color=fff&size=150`;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        relative w-full max-w-lg rounded-2xl border shadow-2xl
        animate-scale-in overflow-hidden
        ${isDarkMode
          ? 'bg-[#12121a] border-white/[0.08] shadow-black/80'
          : 'bg-white border-gray-200/60 shadow-gray-200/60'
        }
      `}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <h2 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all hover:scale-110 ${
              isDarkMode ? 'hover:bg-white/8 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-6 ${isDarkMode ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-1 py-3 mr-6 text-sm font-medium capitalize border-b-2 -mb-px transition-all duration-200
                ${activeTab === tab
                  ? isDarkMode
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-emerald-600 border-emerald-500'
                  : isDarkMode
                    ? 'text-gray-500 border-transparent hover:text-gray-300'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar p-6">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center animate-float text-xl">👤</div>
              <div className="flex space-x-1.5"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-2 animate-slide-down ${
                  isDarkMode ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Saved banner */}
              {saved && (
                <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 animate-slide-down ${
                  isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                }`}>
                  ✅ Profile updated successfully
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div>
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <img
                        src={avatarSrc}
                        alt={profile?.name}
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30"
                      />
                      <label
                        htmlFor="pic-upload"
                        className={`
                          absolute inset-0 rounded-2xl flex items-center justify-center
                          cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          bg-black/50 backdrop-blur-sm
                        `}
                      >
                        {uploading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        <input id="pic-upload" type="file" className="hidden" accept="image/*"
                          onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      Hover to change photo
                    </p>
                  </div>

                  {editing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`
                            w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                            ${isDarkMode
                              ? 'bg-white/4 border-white/[0.08] text-gray-100 focus:border-emerald-500/40'
                              : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-emerald-400'
                            }
                          `}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
                        <input
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className={`
                            w-full px-3.5 py-2.5 rounded-xl border text-sm cursor-not-allowed
                            ${isDarkMode ? 'bg-white/2 border-white/[0.04] text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400'}
                          `}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 transition-all hover:scale-[1.02]"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isDarkMode ? 'bg-white/6 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { label: 'Name', value: profile?.name },
                        { label: 'Email', value: profile?.email },
                      ].map(({ label, value }) => (
                        <div key={label} className={`p-3.5 rounded-xl ${isDarkMode ? 'bg-white/4' : 'bg-gray-50'}`}>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
                        </div>
                      ))}
                      <button
                        onClick={() => setEditing(true)}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 transition-all hover:scale-[1.02] mt-2"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATS TAB */}
              {activeTab === 'statistics' && stats && (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Total Chats', val: stats.total_chats ?? 0 },
                      { label: 'Messages', val: stats.total_messages ?? 0 },
                      { label: 'Member Since', val: stats.joined_date ? new Date(stats.joined_date).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'N/A', small: true },
                    ].map(({ label, val, small }) => (
                      <div key={label} className={`p-3.5 rounded-xl ${isDarkMode ? 'bg-white/4' : 'bg-gray-50'}`}>
                        <p className={`text-[11px] mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                        <p className={`font-bold animate-counter ${small ? 'text-base' : 'text-2xl'} ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/4' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Favourite Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(stats.favorite_topics || []).map((t, i) => (
                        <span key={i} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                          isDarkMode
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                        }`}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
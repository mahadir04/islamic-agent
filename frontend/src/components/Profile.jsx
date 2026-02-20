import { useState, useEffect } from 'react';
import { getUserProfile, getUserStats, updateProfile, uploadProfilePicture } from '../api';

export default function Profile({ isDarkMode, onClose, onUpdate }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', preferences: {} });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, statsData] = await Promise.all([
        getUserProfile(),
        getUserStats()
      ]);
      setProfile(profileData);
      setStats(statsData);
      setFormData({
        name: profileData.name,
        preferences: profileData.preferences || {}
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const pictureUrl = await uploadProfilePicture(file);
      setProfile({ ...profile, picture: pictureUrl });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error uploading picture:', error);
      setError('Failed to upload picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-800'}`}>
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'profile'
                  ? isDarkMode 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-green-600 border-b-2 border-green-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'stats'
                  ? isDarkMode 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-green-600 border-b-2 border-green-600'
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className={`rounded-2xl shadow-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={profile?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=10b981&color=fff&size=150`}
                    alt={profile?.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                  />
                  <label
                    htmlFor="picture-upload"
                    className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      id="picture-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click the camera icon to change your photo
                </p>
              </div>

              {/* Profile Info */}
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-400'
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      } cursor-not-allowed`}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className={`px-6 py-2 rounded-lg transition-all ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.name}</p>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.email}</p>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className={`rounded-2xl shadow-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Chat Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Chats</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.total_chats || 0}
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Messages</p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.total_messages || 0}
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stats.joined_date ? new Date(stats.joined_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className={`mt-6 p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Favorite Topics</p>
                <div className="flex flex-wrap gap-2">
                  {stats.favorite_topics?.map((topic, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import axios from "axios";

export const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // If running inside Capacitor Android app
  if (typeof window !== 'undefined' && (window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:')) {
    return "http://10.0.2.2:8000";
  }
  return "http://localhost:8000";
};

const rawBase = getBaseUrl().replace(/\/$/, "");
const API_URL = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register') && !error.config.url.includes('/daily-guidance')) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Question API
export const askQuestion = async (question, sessionId = null) => {
  try {
    const response = await api.post('/ask', { 
      question, 
      session_id: sessionId 
    });
    return response.data;
  } catch (error) {
    console.error("Backend error:", error);
    return {
      answer: "As-salamu alaykum. I apologize, but I'm having trouble connecting. Please try again later.",
      session_id: null
    };
  }
};

// Session APIs
export const getSessions = async () => {
  try {
    const response = await api.get('/sessions');
    return response.data.sessions || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
};

export const createNewSession = async () => {
  try {
    const response = await api.post('/sessions/new');
    return response.data.session_id;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    await api.delete(`/sessions/${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
};

// Auth APIs
export const loginWithEmail = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerWithEmail = async (email, password, name) => {
  const response = await api.post('/auth/register', { email, password, name });
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Daily Guidance & Prayers
export const getDailyGuidance = async (city, country, lat, lon) => {
  try {
    const params = {};
    if (city) params.city = city;
    if (country) params.country = country;
    if (lat !== undefined && lat !== null) params.lat = lat;
    if (lon !== undefined && lon !== null) params.lon = lon;
    const response = await api.get('/daily-guidance', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching daily guidance:", error);
    return null;
  }
};

export const getUserSunnah = async () => {
  try {
    const response = await api.get('/user/sunnah');
    return response.data.sunnah || [];
  } catch (error) {
    console.error("Error fetching user sunnah:", error);
    return [];
  }
};

export const toggleUserSunnah = async (itemId, done) => {
  try {
    const response = await api.post('/user/sunnah', { item_id: itemId, done });
    return response.data;
  } catch (error) {
    console.error("Error toggling user sunnah:", error);
    return null;
  }
};

// Duas & Adhkar APIs
export const getDuas = async (category = null, search = null) => {
  try {
    const params = {};
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    const response = await api.get('/duas', { params });
    return response.data?.duas || [];
  } catch (error) {
    console.error("Error fetching duas:", error);
    return [];
  }
};

// Quran APIs
export const getSurahs = async () => {
  try {
    const response = await api.get('/quran/surahs');
    return response.data.surahs || [];
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
};

export const getSurah = async (surahId) => {
  try {
    const response = await api.get(`/quran/surah/${surahId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahId}:`, error);
    return null;
  }
};

export const getAyahTafsir = async (surahId, ayahNum) => {
  try {
    const response = await api.get(`/quran/tafsir/${surahId}/${ayahNum}`);
    return response.data?.tafsir;
  } catch (error) {
    console.error(`Error fetching tafsir for ${surahId}:${ayahNum}:`, error);
    return null;
  }
};

// Hadith APIs (Sahih al-Bukhari & Canonical Collections)
export const getHadithBooks = async () => {
  try {
    const response = await api.get('/hadith/books');
    return response.data?.books || [];
  } catch (error) {
    console.error("Error fetching hadith books:", error);
    return [];
  }
};

export const getHadithBook = async (bookNum, page = 1, limit = 25) => {
  try {
    const response = await api.get(`/hadith/book/${bookNum}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hadith book ${bookNum}:`, error);
    return null;
  }
};

export const searchHadiths = async (query, limit = 30) => {
  try {
    const response = await api.get(`/hadith/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data?.results || [];
  } catch (error) {
    console.error("Error searching hadiths:", error);
    return [];
  }
};

export const getHadithSingle = async (hadithNum) => {
  try {
    const response = await api.get(`/hadith/${hadithNum}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hadith ${hadithNum}:`, error);
    return null;
  }
};


// Profile APIs
export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile/me');
    return response.data;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await api.get('/profile/stats');
    return response.data;
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      total_chats: 0,
      total_messages: 0,
      favorite_topics: ["Prayer", "Fasting", "Zakat"],
      joined_date: new Date().toISOString(),
      last_active: new Date().toISOString()
    };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile/me', profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.picture_url;
  } catch (error) {
    console.error("Error uploading picture:", error);
    throw error;
  }
};

export default api;
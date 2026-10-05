import axios from "axios";
import { Capacitor } from "@capacitor/core";

export const isNativeApp = () => {
  try {
    if (typeof window === 'undefined') return false;
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform()) {
      return true;
    }
    if (window.location.protocol === 'capacitor:') return true;
    if (window.location.hostname === 'localhost' && window.location.port === '' && !window.location.origin.includes(':3000')) {
      return true;
    }
  } catch (e) {
    // fallback
  }
  return false;
};

export const PRODUCTION_BACKEND_URL = "https://islamic-agent.onrender.com";

export const getBaseUrl = () => {
  // If running on native mobile app (Capacitor Android / iOS)
  if (isNativeApp()) {
    const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_backend_url') : null;
    if (custom && custom.trim()) {
      const cleanCustom = custom.trim().replace(/\/$/, '');
      // Clear out any old unreachable private network IP addresses left over from developer testing
      if (
        cleanCustom.includes('192.168.') || 
        cleanCustom.includes('10.0.2.2') || 
        cleanCustom.includes('localhost') || 
        cleanCustom.startsWith('http://')
      ) {
        localStorage.removeItem('custom_backend_url');
        return PRODUCTION_BACKEND_URL;
      }
      return cleanCustom;
    }
    return PRODUCTION_BACKEND_URL;
  }

  // 1. In-app manual configuration (saved in localStorage for web testing)
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_backend_url') : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }

  // 4. If running on deployed web app (e.g. Vercel)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_BACKEND_URL;
  }

  // 5. Default for local web development
  return "http://localhost:8000";
};

export const getApiUrl = () => {
  const rawBase = getBaseUrl().replace(/\/$/, "");
  return rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;
};

export const getCustomBackendUrl = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('custom_backend_url') || '' : '';
};

export const setCustomBackendUrl = (url) => {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('custom_backend_url');
  } else {
    let clean = url.trim().replace(/\/$/, "");
    if (clean.endsWith("/api")) {
      clean = clean.slice(0, -4);
    }
    localStorage.setItem('custom_backend_url', clean);
  }
};

export const testBackendConnection = async (testUrl = null) => {
  const target = (testUrl ? testUrl.trim().replace(/\/$/, '') : getBaseUrl());
  try {
    const res = await axios.get(`${target}/health`, { timeout: 4000 });
    return { ok: true, data: res.data, url: target };
  } catch (err) {
    return { ok: false, error: err.message, url: target };
  }
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic baseURL and token on every request
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
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
    const url = error.config?.url || '';
    if (
      error.response?.status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register') &&
      !url.includes('/auth/demo') &&
      !url.includes('/auth/me') &&
      !url.includes('/daily-guidance')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.hash) {
        window.location.hash = '#/login';
      }
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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

export const loginDemo = async () => {
  const response = await api.post('/auth/demo');
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
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    // If not a 401 Unauthorized, return locally cached user so temporary offline / slow server doesn't lose the user
    try {
      const cached = localStorage.getItem('user');
      if (cached && error?.response?.status !== 401) {
        return JSON.parse(cached);
      }
    } catch (_) {}
    throw error;
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
    // Send browser timezone offset so backend can calculate correct "next prayer"
    // getTimezoneOffset() returns minutes BEHIND UTC (e.g. UTC+8 → -480), we negate to get hours ahead
    params.tz_offset = -new Date().getTimezoneOffset() / 60;
    try {
      params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (_) {}
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
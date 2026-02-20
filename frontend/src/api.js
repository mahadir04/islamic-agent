import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
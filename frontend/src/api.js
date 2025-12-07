import axios from "axios";

const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const askQuestion = async (question, sessionId = null) => {
  try {
    const response = await axios.post(`${backendURL}/ask`, { 
      question,
      session_id: sessionId 
    });
    return {
      answer: response.data.answer,
      sessionId: response.data.session_id
    };
  } catch (error) {
    console.error("Backend error:", error);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const response = await axios.get(`${backendURL}/sessions`);
    return response.data.sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await axios.get(`${backendURL}/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
};

export const createNewSession = async () => {
  try {
    const response = await axios.post(`${backendURL}/sessions/new`);
    return response.data.session_id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const deleteSession = async (sessionId) => {
  try {
    await axios.delete(`${backendURL}/sessions/${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};
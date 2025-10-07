import axios from "axios";

const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const askQuestion = async (question) => {
  try {
    const response = await axios.post(`${backendURL}/ask`, { question });
    return response.data.answer;
  } catch (error) {
    console.error("Backend error:", error);
    return "As-salamu alaykum. I apologize, but I'm having trouble connecting to the Islamic knowledge base. Please make sure the backend server is running on port 8000, or try again later.";
  }
};
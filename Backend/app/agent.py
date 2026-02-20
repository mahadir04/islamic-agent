import os
import google.generativeai as genai
import logging
import re

logger = logging.getLogger(__name__)

class IslamicAgent:
    def __init__(self):
        self.model_name = "gemini-3-flash-preview"
        self.gemini_available = self._initialize_gemini()
    
    def _initialize_gemini(self):
        """Initialize Google Gemini AI"""
        try:
            api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDWju7S2zhP9HFtcJ2ZJiBq_I63yGmMI2Q")
            genai.configure(api_key=api_key)
            # Test the connection
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content("Test")
            logger.info(f"✅ Gemini initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Gemini init failed: {e}")
            return False
    
    async def answer_question(self, question: str, conversation_history: list = None) -> str:
        """Answer a question with conversation context"""
        try:
            if not self.gemini_available:
                return "I'm having trouble connecting to the AI service. Please try again later."
            
            # Build conversation context
            context = ""
            if conversation_history and len(conversation_history) > 0:
                context = "Previous conversation:\n"
                for msg in conversation_history[-5:]:  # Last 5 messages
                    role = "User" if msg["role"] == "user" else "Assistant"
                    context += f"{role}: {msg['content']}\n"
            
            # Create prompt
            prompt = f"""You are an Islamic AI assistant. Answer questions based on Islamic teachings from Quran and Hadith.
            
{context}
Current question: {question}

Provide a helpful, accurate Islamic answer. Be respectful and compassionate."""
            
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            
            answer = response.text if response.text else "I couldn't generate an answer. Please try again."
            
            # Clean up the answer
            answer = self._clean_response(answer)
            
            return answer
            
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return "An error occurred. Please try again."
    
    def _clean_response(self, response: str) -> str:
        """Clean and format the response"""
        # Remove any system prompts
        lines = response.split('\n')
        cleaned = []
        for line in lines:
            if not any(word in line.lower() for word in ['system:', 'user:', 'assistant:', 'model:']):
                cleaned.append(line)
        
        cleaned_response = '\n'.join(cleaned).strip()
        
        # Add Islamic greeting if missing
        if not cleaned_response.startswith(('In the name of Allah', 'As-salamu', 'Bismillah')):
            cleaned_response = f"As-salamu alaykum. {cleaned_response}"
        
        # Add closing if missing
        if not cleaned_response.endswith(('Allah knows best.', 'Allah knows best')):
            cleaned_response += "\n\nAnd Allah knows best."
        
        return cleaned_response
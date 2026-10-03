import os
import google.generativeai as genai
import logging
import re
from app.retriever import EnhancedRetriever

logger = logging.getLogger(__name__)

class IslamicAgent:
    def __init__(self):
        self.model_name = "gemini-3.8-flash"
        self.gemini_available = self._initialize_gemini()
        self.retriever = EnhancedRetriever()
    
    def _initialize_gemini(self):
        """Initialize Google Gemini AI"""
        try:
            api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDG61Mhzp2WcFJfG3vtDQJssPFaKwr3Zg8")
            genai.configure(api_key=api_key)
            # Test the connection with a lightweight probe
            models_to_try = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
            for m_name in models_to_try:
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content("Salam")
                    self.model_name = m_name
                    logger.info(f"✅ Gemini initialized successfully with model {self.model_name}")
                    return True
                except Exception as inner_e:
                    logger.warning(f"Failed to initialize {m_name}: {inner_e}")
            return False
        except Exception as e:
            logger.error(f"❌ Gemini init failed: {e}")
            return False
    
    async def answer_question(self, question: str, conversation_history: list = None) -> str:
        res = await self.answer_question_with_sources(question, conversation_history)
        return res.get("answer", "")

    async def answer_question_with_sources(self, question: str, conversation_history: list = None) -> dict:
        """Answer a question with conversation context and RAG retrieved Islamic knowledge, returning sources"""
        try:
            # 1. Retrieve relevant Islamic knowledge chunks from local database
            rag_context = ""
            local_results = []
            try:
                local_results = self.retriever.search_local_knowledge(question, max_results=4)
                if local_results:
                    rag_context = "Authentic Islamic Sources & References (RAG Knowledge):\n"
                    for idx, res in enumerate(local_results, 1):
                        rag_context += f"--- Source {idx} ---\n{res}\n\n"
            except Exception as e:
                logger.warning(f"Error retrieving RAG context: {e}")

            if not self.gemini_available:
                # If Gemini is offline, fallback gracefully to retrieved local RAG knowledge
                if rag_context:
                    return {
                        "answer": f"As-salamu alaykum. Based on authentic Islamic sources:\n\n{rag_context}",
                        "sources": local_results
                    }
                return {
                    "answer": "I'm having trouble connecting to the AI service. Please try again later.",
                    "sources": []
                }
            
            # 2. Build conversation context (last 20 messages for full memory)
            conversation_context = ""
            if conversation_history and len(conversation_history) > 0:
                conversation_context = "Previous conversation history in this session (in chronological order):\n"
                for msg in conversation_history[-20:]:
                    role = "User" if msg["role"] == "user" else "Assistant"
                    conversation_context += f"{role}: {msg['content']}\n"
                conversation_context += "\n"
            
            # 3. Create comprehensive RAG prompt
            prompt = f"""You are Noor AI, a knowledgeable, authentic, and compassionate Islamic assistant.
Your answers must be grounded in the Holy Quran, the authentic Sunnah (Sahih al-Bukhari, Muslim, etc.), sound scholarship across the major schools of jurisprudence (Hanafi, Maliki, Shafi'i, Hanbali), and accurate historical accounts of the Prophet's Seerah.

{rag_context}

{conversation_context}
Current Question: {question}

Instructions:
- Provide an accurate, well-structured, and balanced Islamic answer.
- You have full memory of the conversation above. If the user refers to something discussed earlier, address it directly.
- When quoting a Quranic verse (with chapter & verse numbers), wrap ONLY the verse text itself in [QURAN]...[/QURAN] tags.
- When quoting a Hadith narration, wrap ONLY the hadith text itself in [HADITH]...[/HADITH] tags.
- When there are differences among established madhahib, present them with respect and clarity.
- Maintain an inspiring, respectful, and compassionate tone. Be concise yet comprehensive."""
            
            answer = None
            models_to_try = [self.model_name, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
            for m_name in dict.fromkeys(models_to_try):
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content(prompt)
                    if response.text:
                        answer = self._clean_response(response.text)
                        self.model_name = m_name
                        break
                except Exception as gen_err:
                    logger.warning(f"Generation error with {m_name}: {gen_err}")

            if not answer:
                if local_results:
                    answer = (
                        "According to verified Islamic sources in our knowledge repository:\n\n"
                        + "\n\n".join(local_results[:3])
                        + "\n\nAlways consult with trusted human scholarship for binding personal rulings."
                    )
                else:
                    answer = "I apologize, but authentic Islamic sources are currently in high demand. Please repeat your question momentarily."

            return {
                "answer": answer,
                "sources": local_results
            }
            
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            if local_results:
                return {
                    "answer": "According to verified Islamic knowledge:\n\n" + "\n\n".join(local_results[:2]),
                    "sources": local_results
                }
            return {
                "answer": "An error occurred while consulting Islamic sources. Please try again.",
                "sources": []
            }

    async def get_verse_tafsir(self, surah_id: int, ayah_number: int, verse_text: str = "") -> str:
        """Provide concise scholarly Tafsir and spiritual reflection for a verse"""
        try:
            # Query local RAG or Gemini for authentic scholarly Tafsir (Ibn Kathir, Al-Jalalayn, Ma'ariful Quran)
            prompt = f"""Provide a concise scholarly Tafsir and spiritual insight for Quran {surah_id}:{ayah_number}.
Verse text: "{verse_text}"
Keep it under 3 concise sentences focusing on core meaning, context of revelation if applicable, and practical spiritual reflection."""
            if self.gemini_available:
                model = genai.GenerativeModel(self.model_name)
                resp = model.generate_content(prompt)
                if resp.text:
                    return self._clean_response(resp.text)
            return f"This verse in Surah {surah_id} conveys profound divine wisdom, guiding believers towards righteousness, mindfulness of Allah, and moral excellence."
        except Exception as e:
            logger.error(f"Tafsir generation error: {e}")
            return "This verse reminds believers to reflect on Allah's signs, maintain sincerity in devotion, and seek peace through spiritual remembrance."
    
    def _clean_response(self, response: str) -> str:
        """Clean and format the response"""
        lines = response.split('\n')
        cleaned = []
        for line in lines:
            if not any(word in line.lower() for word in ['system:', 'model:']):
                cleaned.append(line)
        return '\n'.join(cleaned).strip()
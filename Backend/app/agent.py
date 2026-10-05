import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
import logging
import re
from app.retriever import EnhancedRetriever
from app.prompt_templates import (
    get_prompt_for_question,
    format_offline_rag_response,
    format_final_response,
    get_response_type_for_question
)

# Ensure .env is loaded
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

logger = logging.getLogger(__name__)

class IslamicAgent:
    def __init__(self):
        self.model_name = "gemini-3.5-flash-lite"
        self.gemini_available = self._initialize_gemini()
        self.retriever = EnhancedRetriever()
    
    def _initialize_gemini(self):
        """Configure Google Gemini AI client with API key from environment"""
        try:
            raw_key = os.getenv("GEMINI_API_KEY", "")
            api_key = raw_key.strip().strip('"').strip("'")
            if not api_key:
                logger.warning("⚠️ GEMINI_API_KEY not found in environment")
                return False
            genai.configure(api_key=api_key)
            self.model_name = "gemini-3.5-flash-lite"
            logger.info("✅ Gemini AI client successfully configured")
            return True
        except Exception as e:
            logger.error(f"❌ Gemini config error: {e}")
            return False
    
    def _contextualize_query(self, question: str, conversation_history: list = None) -> tuple:
        """
        Extract the core subject from previous conversation when a follow-up question
        uses pronouns (e.g. 'how he die', 'who killed him', 'what did he do').
        Returns: (contextualized_search_query, detected_entity)
        """
        if not conversation_history or len(conversation_history) == 0:
            return question, ""

        q_lower = question.lower()
        pronoun_patterns = [
            r'\bhe\b', r'\bhim\b', r'\bhis\b', r'\bshe\b', r'\bher\b', 
            r'\bthey\b', r'\bthem\b', r'\bit\b', r'\bthis\b', r'\bthat\b',
            r'\bwho killed him\b', r'\bhow he die\b', r'\bhow did he die\b',
            r'\bwhen did he die\b', r'\bwhy did he\b', r'\bwhat did he\b'
        ]
        has_pronoun = any(re.search(p, q_lower) for p in pronoun_patterns)
        is_short_followup = len(question.split()) <= 6

        if not has_pronoun and not is_short_followup:
            return question, ""

        user_msgs = [m.get("content", "") for m in conversation_history if m.get("role") == "user"]
        bot_msgs = [m.get("content", "") for m in conversation_history if m.get("role") in ["bot", "assistant"]]

        if not user_msgs:
            return question, ""

        last_user_q = user_msgs[-1]
        entity = ""
        m = re.search(r'(?:who is|who was|tell me about|what is|about)\s+([a-zA-Z\s\'-]+)', last_user_q, re.IGNORECASE)
        if m:
            entity = m.group(1).strip()
        else:
            stopwords = {"who", "is", "was", "the", "a", "an", "about", "tell", "me", "what", "how", "why", "when", "where", "can", "you", "explain", "in", "islam"}
            words = [w for w in re.findall(r'[a-zA-Z]+', last_user_q) if w.lower() not in stopwords]
            if words:
                entity = " ".join(words)

        if not entity and bot_msgs:
            first_line = bot_msgs[-1].split('\n')[0]
            bold_match = re.search(r'\*\*([^*]+)\*\*', first_line)
            if bold_match and len(bold_match.group(1).split()) <= 4:
                entity = bold_match.group(1).strip()

        if entity and entity.lower() not in q_lower:
            search_query = f"{entity} {question}"
            return search_query, entity
        
        return question, entity

    async def answer_question(self, question: str, conversation_history: list = None) -> str:
        res = await self.answer_question_with_sources(question, conversation_history)
        return res.get("answer", "")

    async def answer_question_with_sources(self, question: str, conversation_history: list = None) -> dict:
        """Answer a question strictly following the enriched prompt template and answer design, integrating RAG context"""
        local_results = []
        try:
            # 1. Contextualize query with conversation history for accurate RAG retrieval
            search_query, detected_entity = self._contextualize_query(question, conversation_history)
            
            rag_context = ""
            try:
                raw_results = self.retriever.search_local_knowledge(search_query, max_results=4)
                
                # Filter out irrelevant chunks if a specific entity was being followed up
                if detected_entity:
                    entity_words = [w.lower() for w in re.findall(r'[a-zA-Z]+', detected_entity) if len(w) > 2]
                    filtered = [
                        res for res in raw_results 
                        if any(w in res.lower() for w in entity_words)
                    ]
                    local_results = filtered
                else:
                    local_results = raw_results
                    
                if local_results:
                    rag_context = "Authentic Islamic Sources & References (RAG Knowledge):\n"
                    for idx, res in enumerate(local_results, 1):
                        rag_context += f"--- Source {idx} ---\n{res}\n\n"
            except Exception as e:
                logger.warning(f"Error retrieving RAG context: {e}")

            # If Gemini was not initialized initially, attempt once more
            if not self.gemini_available:
                self.gemini_available = self._initialize_gemini()

            # If Gemini is still offline, fallback gracefully to standardized Answer Design using retrieved RAG knowledge
            if not self.gemini_available:
                return {
                    "answer": format_offline_rag_response(question, local_results),
                    "sources": local_results
                }
            
            # 2. Determine RAG context quality
            context_quality = "rich" if len(local_results) >= 2 else ("good" if len(local_results) == 1 else "none")

            # 3. Always assemble prompt using the enriched prompt template system
            prompt = get_prompt_for_question(
                question=question,
                context=rag_context,
                context_quality=context_quality,
                conversation_history=conversation_history
            )
            
            answer = None
            models_to_try = [
                self.model_name,
                "gemini-3.5-flash-lite",
                "gemini-3.6-flash",
                "gemini-3.1-flash-lite",
                "gemini-flash-lite-latest",
                "gemini-3-flash-preview",
                "gemini-3.8-flash",
                "gemini-3.7-flash"
            ]
            for m_name in dict.fromkeys(models_to_try):
                try:
                    model = genai.GenerativeModel(m_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        answer = self._clean_response(response.text)
                        self.model_name = m_name
                        break
                except Exception as gen_err:
                    logger.warning(f"Generation error with {m_name}: {gen_err}")

            if not answer:
                answer = format_offline_rag_response(question, local_results)

            return {
                "answer": answer,
                "sources": local_results
            }
            
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return {
                "answer": format_offline_rag_response(question, local_results),
                "sources": local_results
            }

    async def get_verse_tafsir(self, surah_id: int, ayah_number: int, verse_text: str = "") -> str:
        """Provide concise scholarly Tafsir and spiritual reflection for a verse"""
        try:
            # Query local RAG or Gemini for authentic scholarly Tafsir (Ibn Kathir, Al-Jalalayn, Ma'ariful Quran)
            prompt = f"""Provide a concise scholarly Tafsir and spiritual insight for Quran {surah_id}:{ayah_number}.
Verse text: "{verse_text}"
Keep it under 3 concise sentences focusing on core meaning, context of revelation if applicable, and practical spiritual reflection."""
            if self.gemini_available:
                for m_name in [self.model_name, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"]:
                    try:
                        model = genai.GenerativeModel(m_name)
                        resp = model.generate_content(prompt)
                        if resp and resp.text:
                            return self._clean_response(resp.text)
                    except Exception:
                        continue
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
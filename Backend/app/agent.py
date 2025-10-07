import os
import re
import google.generativeai as genai
from app.retriever import EnhancedRetriever
from app.prompt_templates import (
    get_prompt_for_question, 
    format_final_response,
    should_recommend_scholar,
    get_scholar_recommendation_topic,
    is_complex_fiqh_question,
    requires_detailed_fiqh,
    get_response_type_for_question
)
import logging

logger = logging.getLogger(__name__)

class IslamicAgent:
    def __init__(self):
        self.retriever = EnhancedRetriever()
        self.model_name = "gemini-2.5-flash"  # ✅ FIXED: moved before _initialize_gemini
        self.gemini_available = self._initialize_gemini()

    def _initialize_gemini(self):
        """Initialize Google Gemini AI"""
        try:
            api_key = "AIzaSyCd7Jk4v86NEJDGOVqL0gqbl765waHmstE"
            if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
                logger.error("❌ Gemini API key not configured")
                return False

            genai.configure(api_key=api_key)

            try:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content("Say 'Connection successful' in Arabic")
                logger.info(f"✅ Google Gemini AI ({self.model_name}) initialized successfully")
                return True
            except Exception as test_error:
                logger.error(f"❌ Gemini test failed: {test_error}")
                try:
                    self.model_name = "gemini-pro"
                    model = genai.GenerativeModel(self.model_name)
                    response = model.generate_content("Test connection")
                    logger.info(f"✅ Using fallback model: {self.model_name}")
                    return True
                except Exception as fallback_error:
                    logger.error(f"❌ Fallback model also failed: {fallback_error}")
                    return False

        except Exception as e:
            logger.error(f"❌ Failed to initialize Google Gemini AI: {e}")
            return False

    async def answer_question(self, question: str) -> str:
        try:
            logger.info(f"📝 Processing question: {question}")

            if self._is_inappropriate_question(question):
                return format_final_response("", "inappropriate")

            if should_recommend_scholar(question):
                topic = get_scholar_recommendation_topic(question)
                return format_final_response("", "scholar_recommendation", topic=topic)

            if is_complex_fiqh_question(question) or requires_detailed_fiqh(question):
                logger.info("🎯 Complex fiqh question detected - routing directly to Gemini")
                return await self._get_complex_fiqh_response(question)

            local_results = self.retriever.search_local_knowledge(question)
            context_quality = self._assess_context_quality(question, local_results)
            logger.info(f"🔍 Context quality: {context_quality}")

            return await self._get_smart_response(question, local_results, context_quality)

        except Exception as e:
            logger.error(f"💥 Error in answer_question: {e}")
            return self._get_fallback_response(question)

    async def _get_complex_fiqh_response(self, question: str) -> str:
        if not self.gemini_available:
            return self._get_fiqh_fallback_response(question)

        try:
            minimal_context = self.retriever.search_local_knowledge(question, max_results=2)
            context = "\n\n".join(minimal_context) if minimal_context else "General Islamic principles."
            prompt = get_prompt_for_question(question, context, "complex")
            gemini_response = await self._call_gemini(prompt)

            if gemini_response and self._is_quality_response(gemini_response):
                response_type = get_response_type_for_question(question)
                return format_final_response(gemini_response, response_type)
            else:
                return self._get_fiqh_fallback_response(question)

        except Exception as e:
            logger.error(f"Gemini complex fiqh response failed: {e}")
            return self._get_fiqh_fallback_response(question)

    async def _get_smart_response(self, question: str, local_results: list, context_quality: str) -> str:
        context = "\n\n".join(local_results) if local_results else "General Islamic knowledge base."

        if self.gemini_available:
            try:
                prompt = get_prompt_for_question(question, context, context_quality)
                gemini_response = await self._call_gemini(prompt)

                if gemini_response and self._is_quality_response(gemini_response):
                    response_type = get_response_type_for_question(question)
                    return format_final_response(gemini_response, response_type)
            except Exception as e:
                logger.error(f"Gemini response failed: {e}")

        return self._get_fallback_response(question, local_results)

    async def _call_gemini(self, prompt: str) -> str:
        try:
            model = genai.GenerativeModel(self.model_name)

            generation_config = {
                "temperature": 0.3,
                "top_p": 0.85,
                "top_k": 40,
                "max_output_tokens": 2048,
            }

            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH", 
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )

            if response.text:
                cleaned_response = self._clean_scholarly_response(response.text)
                logger.info(f"✅ Gemini response received ({len(cleaned_response)} characters)")
                return cleaned_response
            else:
                logger.error("Gemini returned empty response")
                if response.prompt_feedback:
                    logger.error(f"Prompt feedback: {response.prompt_feedback}")
                return None

        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return None

    def _clean_scholarly_response(self, response: str) -> str:
        lines = response.split('\n')
        cleaned_lines = []

        for line in lines:
            line_lower = line.lower()
            if not any(keyword in line_lower for keyword in ['system:', 'user:', 'assistant:', 'instruction:', 'model:']):
                cleaned_lines.append(line)

        cleaned_response = '\n'.join(cleaned_lines).strip()

        prefixes_to_remove = [
            "**", "```", "assistant:", "model:", "islamic ai:"
        ]

        for prefix in prefixes_to_remove:
            if cleaned_response.startswith(prefix):
                cleaned_response = cleaned_response[len(prefix):].strip()

        if not cleaned_response.startswith(('In the name of Allah', 'As-salamu alaykum', 'بسم الله')):
            cleaned_response = f"In the name of Allah, the Most Merciful, the Most Compassionate.\n\n{cleaned_response}"

        if not cleaned_response.strip().endswith(('Allah knows best.', 'Allah knows best', 'والله أعلم')):
            cleaned_response += "\n\nAnd Allah knows best."

        return cleaned_response

    def _get_fiqh_fallback_response(self, question: str) -> str:
        return f"""As-salamu alaykum. Regarding your question about "{question}":

This is a complex fiqh matter that requires detailed scholarly analysis. The ruling may depend on specific circumstances and interpretations of classical texts.

For accurate guidance on this Hanafi fiqh question, I strongly recommend consulting with qualified Hanafi scholars who can:

1. Analyze your specific situation
2. Reference classical Hanafi texts like Hedaya, Fatawa Alamgiri, Radd al-Muhtar, etc.
3. Consider all relevant conditions and exceptions
4. Provide a personalized ruling based on proper ijtihad

May Allah grant us understanding of His divine law and guide us to what pleases Him."""

    def _is_inappropriate_question(self, question: str) -> bool:
        inappropriate_keywords = [
            'porn', 'xxx', 'adult', 'explicit', 'nude', 'sexually explicit', 
            'illegal activities', 'criminal instructions', 'violence instructions', 
            'hate speech', 'discrimination', 'blasphemy', 'disrespect prophet',
            'disrespect quran', 'terrorism', 'extremism'
        ]

        question_lower = question.lower()
        return any(keyword in question_lower for keyword in inappropriate_keywords)

    def _assess_context_quality(self, question: str, results: list) -> str:
        if not results:
            return "poor"

        question_words = set(re.findall(r'\b\w+\b', question.lower()))
        relevant_words = [word for word in question_words if len(word) > 3]

        if not relevant_words:
            return "minimal"

        total_matches = 0
        for result in results:
            result_lower = result.lower()
            matches = sum(1 for word in relevant_words if word in result_lower)
            total_matches += matches

        if total_matches >= len(relevant_words) * 0.8:
            return "rich"
        elif total_matches >= len(relevant_words) * 0.4:
            return "good"
        elif total_matches >= 2:
            return "minimal"
        else:
            return "poor"

    def _is_quality_response(self, response: str) -> bool:
        if not response or len(response.strip()) < 50:
            return False

        refusal_patterns = [
            r'i cannot answer',
            r'i cannot provide',
            r'i am not able',
            r'i don\'t have.*information',
            r'outside.*knowledge',
            r'unable to answer',
            r'i\'m sorry,? but i cannot',
            r'i cannot.*that question',
            r'as an ai',
            r'i am an ai',
            r'i\'m just an ai'
        ]

        response_lower = response.lower()
        return not any(re.search(pattern, response_lower) for pattern in refusal_patterns)

    def _get_fallback_response(self, question: str, local_results: list = None) -> str:
        general_guidance = ""

        if local_results:
            context = "\n\n".join(local_results[:2])
            general_guidance = f"I found some relevant information:\n\n{context}\n\n"

        general_guidance += "This is based on our available Islamic knowledge resources."

        return format_final_response(
            "",
            "fallback",
            question=question,
            general_guidance=general_guidance
        )

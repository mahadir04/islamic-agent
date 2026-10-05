"""
Islamic AI Agent Prompt Templates
Advanced prompt management optimized for Google Gemini AI with RAG Context & Unified Answer Design
"""

import re

# ===== CORE SYSTEM PROMPTS =====
SYSTEM_BASE = """You are Noor AI, an authentic, deeply knowledgeable, and compassionate Islamic assistant.
Your mission is to provide authentic, beautifully structured Islamic guidance grounded strictly in the Holy Quran, the authentic Sunnah (Sahih al-Bukhari, Sahih Muslim, Sunan collections), sound consensus (Ijma), and balanced scholarship across the established schools of jurisprudence (Hanafi, Maliki, Shafi'i, Hanbali), as well as authentic Seerah and Islamic history.

CORE IDENTITY & SCHOLARSHIP:
- Ground all guidance in verified, authentic Islamic sources.
- Present scholarly differences (ikhtilaf) with utmost respect, clarity, and balance.
- Maintain a warm, dignified, spiritually uplifting, and educational tone. Be concise yet comprehensive.

CITATION TAGGING RULES (CRITICAL FOR UI RENDERING):
- When quoting a Quranic verse, wrap ONLY the translated verse text itself inside [QURAN]...[/QURAN] tags. Follow immediately with the Surah name and verse reference in parentheses.
  Example: [QURAN]Indeed, with hardship comes ease.[/QURAN] (Surah Ash-Sharh, 94:6)
- When quoting a Hadith narration, wrap ONLY the narration text itself inside [HADITH]...[/HADITH] tags. Follow immediately with the Hadith collection and number in parentheses.
  Example: The Prophet (ﷺ) said: [HADITH]The best among you are those who have the best manners and character.[/HADITH] (Sahih Al-Bukhari, 6064)
- Keep citations accurate and do not place source names or commentary inside the tags.

MANDATORY ANSWER DESIGN ARCHITECTURE:
Every response you generate MUST strictly follow this structured visual hierarchy and layout:

1. WARM ISLAMIC GREETING & DIRECT VERDICT/SUMMARY
   - Begin with: "As-salamu alaykum wa rahmatullahi wa barakatuh."
   - Follow immediately with a clear, direct, and concise 1-2 sentence core answer / Islamic ruling so the user has immediate clarity before reading the full explanation.

2. QURANIC FOUNDATION
   - Section Heading: ### 📖 Divine Wisdom & Quranic Evidence
   - Cite relevant Quranic verse(s) using the [QURAN]verse[/QURAN] format with (Surah Name, Chapter:Verse).
   - Provide a concise 1-2 sentence tafsir or context explaining how this divine revelation addresses the matter.

3. PROPHETIC SUNNAH & HADITH
   - Section Heading: ### 📜 Prophetic Guidance & Hadith Evidence
   - Cite relevant Hadith(s) using the [HADITH]hadith[/HADITH] format with (Collection, Number).
   - Provide a concise 1-2 sentence explanation of the prophetic instruction and wisdom.

4. SCHOLARLY PERSPECTIVES & JURISTIC ANALYSIS
   - Section Heading: ### ⚖️ Scholarly Perspectives & Juristic Analysis
   - Ground this in authentic Islamic jurisprudence and the provided RAG knowledge context.
   - Explain the legal ruling (Wajib/Fard, Sunnah/Mustahabb, Mubah, Makruh, or Haram), the underlying principles/reasons (Illah), and mention major madhhab positions (Hanafi, Shafi'i, Maliki, Hanbali) if applicable.

5. PRACTICAL TAKEAWAYS & DAILY APPLICATION
   - Section Heading: ### 💡 Practical Takeaways & Daily Application
   - Provide 2 to 4 actionable, practical bullet points guiding the user on how to apply this knowledge in their daily life.

6. SPIRITUAL REFLECTION & CLOSING DU'A
   - Provide a brief uplifting spiritual reminder or du'a.
   - Conclude with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"
   - If the inquiry involves complex personal litigation, divorce, inheritance disputes, or court cases, kindly add a note recommending consultation with a trusted local scholar.
"""

# ===== SPECIALIZED PROMPT TEMPLATES =====

# Template when RAG context is available from repository documents
PROMPT_WITH_CONTEXT = """
AUTHENTIC ISLAMIC KNOWLEDGE CONTEXT (RETRIEVED FROM REPOSITORY):
{context}

USER INQUIRY:
{question}

TASK & ANSWER INSTRUCTIONS:
1. Synthesize the authentic Islamic knowledge retrieved above from the Quran, Hadith, Seerah, and classical Fiqh.
2. DO NOT simply dump quotes or text chunks. Make the knowledge easy to understand for the user:
   - For every Quran verse cited, explain its meaning, context of revelation, and divine purpose in simple, clear language.
   - For every Hadith cited, explain the prophetic wisdom, background, and what the Prophet (ﷺ) intended for us to learn.
   - Synthesize the juristic rulings and scholarly perspectives into clear, practical explanations.
3. Structure your response according to the MANDATORY ANSWER DESIGN:
   1. Warm Islamic Greeting ("As-salamu alaykum wa rahmatullahi wa barakatuh") + Immediate clear answer/summary (1-2 sentences).
   2. ### 📖 Divine Wisdom & Quranic Evidence
      - Cite relevant Quranic verse in [QURAN]...[/QURAN] tags with (Surah Name, Chapter:Verse).
      - Follow with a lucid, easy-to-read explanation and reflection.
   3. ### 📜 Prophetic Guidance & Hadith Evidence
      - Cite authentic Hadith in [HADITH]...[/HADITH] tags with (Collection, Hadith Number).
      - Follow with a practical explanation of the lesson and context.
   4. ### ⚖️ Scholarly Perspectives & Juristic Analysis
      - Explain the ruling, underlying wisdom (Hikmah), and classical viewpoints.
   5. ### 💡 Practical Thoughts & Spiritual Reflection
      - Provide 2-4 deep, actionable thoughts for daily spiritual life and application.
   6. Uplifting closing du'a ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

CRITICAL: Never output raw internal tags like "--- Source 1 ---" or file paths. Seamlessly weave the evidence into a rich, enlightening, compassionate explanation.

Answer:"""

# Template when RAG context is absent or minimal in repository documents
PROMPT_WITHOUT_CONTEXT = """
USER INQUIRY:
{question}

TASK & ANSWER INSTRUCTIONS:
No specific document in the local repository directly matched this query. As Noor AI, provide a comprehensive, authentic, and compassionate Islamic answer directly from your deep knowledge of the Holy Quran, authentic Sunnah (Sahih al-Bukhari, Sahih Muslim, Sunan collections), consensus (Ijma), and sound classical scholarship.

You MUST:
1. Provide a warm greeting ("As-salamu alaykum wa rahmatullahi wa barakatuh") and a direct, compassionate, and clear verdict/summary right at the beginning.
2. Provide authentic Quranic foundations using [QURAN]...[/QURAN] tags with (Surah Name, Chapter:Verse) accompanied by an easy-to-understand explanation of its divine wisdom and context.
3. Provide authentic Prophetic Hadiths using [HADITH]...[/HADITH] tags with (Collection, Number) accompanied by a clear explanation of the prophetic lesson and meaning.
4. Provide scholarly perspectives, juristic analysis, and underlying principles.
5. Provide ### 💡 Practical Thoughts & Spiritual Reflection with 2 to 4 actionable insights for daily life.
6. End with an uplifting du'a and "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# Complex Fiqh Prompt
PROMPT_COMPLEX_FIQH = """
ISLAMIC FIQH QUESTION:
{question}

RELEVANT JURISPRUDENTIAL CONTEXT (RAG):
{context}

TASK & ANSWER DESIGN INSTRUCTIONS:
You are an expert Islamic jurist and scholar providing a comprehensive, evidence-based fatwa and analysis.
You MUST follow the MANDATORY ANSWER DESIGN layout while enriching the scholarly depth:

1. Warm Islamic Opening ("As-salamu alaykum wa rahmatullahi wa barakatuh") followed by an explicit, unambiguous statement of the primary ruling (Halal/Mubah, Wajib/Fard, Sunnah, Makruh, or Haram).
2. ### 📖 Divine Wisdom & Quranic Evidence
   - Quranic daleel (proofs) wrapped in [QURAN]...[/QURAN] tags with (Surah Name, Chapter:Verse).
3. ### 📜 Prophetic Guidance & Hadith Evidence
   - Hadith daleel from primary collections wrapped in [HADITH]...[/HADITH] tags with (Collection, Hadith Number).
4. ### ⚖️ Detailed Jurisprudential Analysis (Fiqh Rulings & Madhahib)
   - Provide the classical jurisprudence position, referencing renowned works (e.g. Al-Hidayah, Radd al-Muhtar, Fatawa Alamgiri, Bada'i' al-Sana'i', Al-Mughni, Al-Majmu').
   - Explain the juristic reasoning (Qiyas, Illah, Istihsan, or Sadd al-Dhara'i).
   - Detail prerequisites, conditions (Shurut), and exceptions.
   - Mention the consensus (Ijma) or major madhhab positions (Hanafi, Maliki, Shafi'i, Hanbali) if opinions differ.
5. ### 💡 Practical Takeaways & Daily Application
   - Actionable guidelines for modern practice.
6. Spiritual closing and warning for personal legal disputes to consult a local Mufti/Qadi, ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# Detailed Fiqh Inquiry
PROMPT_DETAILED_FIQH = """
DETAILED FIQH INQUIRY:
{question}

RELEVANT ISLAMIC CONTEXT (RAG):
{context}

TASK & ANSWER DESIGN INSTRUCTIONS:
Provide a detailed scholarly Islamic ruling with comprehensive daleel from Quran, Sunnah, and classical consensus.
You MUST follow the MANDATORY ANSWER DESIGN layout:

1. Warm Islamic Greeting + Direct core ruling.
2. ### 📖 Divine Wisdom & Quranic Evidence
   - Quranic verse(s) wrapped in [QURAN]...[/QURAN] tags with citations.
3. ### 📜 Prophetic Guidance & Hadith Evidence
   - Prophetic narrations wrapped in [HADITH]...[/HADITH] tags with citations.
4. ### ⚖️ Detailed Jurisprudential Analysis (Fiqh Rulings & Madhahib)
   - Classical scholarly opinions, legal maxims (Qawa'id Fiqhiyyah), and contemporary application.
5. ### 💡 Practical Takeaways & Daily Application
   - 2-4 actionable bullet points.
6. Spiritual closing ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# Real-world Events & Modern Inquiries
PROMPT_CURRENT_EVENTS = """
CONTEMPORARY SITUATION / CURRENT EVENT:
{question}

RELEVANT ISLAMIC CONTEXT (RAG):
{context}

TASK & ANSWER DESIGN INSTRUCTIONS:
Provide an authentic Islamic perspective on this contemporary event/issue using timeless Islamic ethical and legal principles.
Follow the MANDATORY ANSWER DESIGN:

1. Warm Islamic Greeting + Balanced Islamic perspective summary.
2. ### 📖 Divine Wisdom & Quranic Evidence
   - Timeless Quranic principles wrapped in [QURAN]...[/QURAN] tags with (Surah Name, Chapter:Verse).
3. ### 📜 Prophetic Guidance & Historical Precedent
   - Hadith and Seerah precedents wrapped in [HADITH]...[/HADITH] tags with collection references.
4. ### ⚖️ Ethical & Juristic Evaluation
   - Analysis through the lens of Maqasid al-Shariah (Preservation of Faith, Life, Intellect, Lineage, Wealth) and Islamic ethics (justice, mercy, patience, peace).
5. ### 💡 Practical Takeaways & Positive Action Steps
   - Constructive, practical actions Muslims can undertake.
6. Uplifting closing du'a ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# Historical & Seerah Analysis
PROMPT_HISTORICAL = """
HISTORICAL / SEERAH INQUIRY:
{question}

RELEVANT ISLAMIC CONTEXT (RAG):
{context}

TASK & ANSWER DESIGN INSTRUCTIONS:
Provide an accurate historical and spiritual account drawing upon authentic Seerah, Quranic narratives, and classical Islamic history.
Follow the MANDATORY ANSWER DESIGN:

1. Warm Islamic Greeting + Clear overview of the historical event/figure.
2. ### 📖 Divine Wisdom & Quranic Context
   - Relevant Quranic verses wrapped in [QURAN]...[/QURAN] tags with citations.
3. ### 📜 Prophetic Guidance & Historical Account
   - Hadith narrations and verified Seerah accounts wrapped in [HADITH]...[/HADITH] tags with source citations.
4. ### ⚖️ Historical Lessons & Scholarly Insights
   - Deep analysis of the context, moral wisdom, and enduring principles.
5. ### 💡 Practical Takeaways & Contemporary Lessons
   - How believers can draw inspiration and apply these lessons today.
6. Spiritual closing du'a ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# Ethical Dilemma
PROMPT_ETHICAL_DILEMMA = """
REAL-LIFE ETHICAL DILEMMA:
{question}

RELEVANT ISLAMIC CONTEXT (RAG):
{context}

TASK & ANSWER DESIGN INSTRUCTIONS:
Provide compassionate, principled Islamic moral and ethical guidance for this situation.
Follow the MANDATORY ANSWER DESIGN:

1. Warm Islamic Greeting + Clear ethical recommendation / ruling.
2. ### 📖 Divine Wisdom & Quranic Evidence
   - Core Quranic verses on justice, compassion, or truthfulness wrapped in [QURAN]...[/QURAN] tags.
3. ### 📜 Prophetic Guidance & Hadith Evidence
   - Prophetic teachings wrapped in [HADITH]...[/HADITH] tags with collection references.
4. ### ⚖️ Ethical Analysis & Maqasid al-Shariah
   - Evaluation balancing rights of Allah and rights of fellow human beings (Huquq al-Ibad).
5. ### 💡 Practical Steps & Solutions
   - Actionable, balanced steps to resolve the dilemma with integrity.
6. Encouraging closing du'a ending with: "*And Allah (Subhanahu wa Ta'ala) knows best.*"

Answer:"""

# ===== TOPIC SPECIFIC GUIDELINES =====
TOPIC_SPECIFIC_PROMPTS = {
    "prayer": "Focus on prayer rulings, times, conditions, spiritual tranquility (Khushu), and related Quran/Hadith evidences.",
    "fasting": "Explain fasting rules, exemptions, spiritual benefits, and Ramadan specifics with classical fiqh evidences.",
    "zakat": "Detail Zakat calculations, nisab thresholds, recipients (Asnaf), and ethical wealth purification.",
    "hajj": "Describe Hajj/Umrah rites, spiritual significance, and practical prerequisites with authentic sources.",
    "quran": "Provide Quranic guidance, recitation etiquettes, context of revelation (Asbab al-Nuzul), and tafsir reflections.",
    "hadith": "Explain Hadith sciences, authenticity gradings, and practical life applications with exact collection references.",
    "fiqh": "Provide jurisprudential rulings with classical daleel, madhhab consensus/differences, and practical application.",
    "aqeedah": "Explain Islamic theology, Tawheed, and articles of faith with Quranic and sound rational evidences.",
    "seerah": "Share the Prophet Muhammad's (ﷺ) life lessons, historical context, and character excellence (Khluluq).",
    "ethics": "Teach Islamic manners (Adab), character building (Akhlaq), and social conduct from Quran and Sunnah foundations.",
    "current events": "Apply timeless Islamic ethical principles to contemporary challenges while remaining objective and principled.",
    "history": "Provide authentic Islamic historical perspectives and extract moral and spiritual lessons.",
    "family": "Offer compassionate guidance on marriage, parenting, rights of spouses, and family harmony.",
    "business": "Cover Islamic business ethics, halal earnings, avoidance of Riba/Gharar, and ethical contracts.",
    "health": "Address health, medicine, and wellness balancing prophetic medicine (Tibb Nabawi) with modern medical science.",
    "education": "Emphasize the paramount importance of seeking beneficial knowledge ('Ilm Nafi') and spiritual character."
}

# ===== ENHANCED RESPONSE TEMPLATES =====
RESPONSE_TEMPLATES = {
    "success_with_context": "{answer}",
    "success_general": "{answer}",
    "current_events": "{answer}",
    "historical": "{answer}",
    "ethical": "{answer}",
    "complex_fiqh": "{answer}",
    "detailed_fiqh": "{answer}",
    "fallback": """As-salamu alaykum wa rahmatullahi wa barakatuh.

Regarding your question about "{question}":

### ⚖️ Authentic Knowledge from Islamic Sources
{general_guidance}

### 💡 Practical Takeaways & Guidance
- Seek clarity through authentic knowledge and constant remembrance of Allah (Dhikr).
- For personal or legal decisions (e.g., marriage, divorce, inheritance disputes), please consult a qualified local Islamic scholar or Mufti.

May Allah grant us deep understanding of His Deen and guide our steps to what pleases Him.

*And Allah (Subhanahu wa Ta'ala) knows best.*"""
}

# ===== OFFLINE RAG RESPONSE FORMATTER =====
def format_offline_rag_response(question: str, rag_sources: list) -> str:
    """
    Format retrieved RAG sources into the standardized Answer Design layout
    when Gemini or generative AI is temporarily unavailable or in fallback mode.
    """
    if not rag_sources:
        return (
            "As-salamu alaykum wa rahmatullahi wa barakatuh.\n\n"
            "I apologize, but our authentic Islamic knowledge repository is momentarily undergoing maintenance. "
            "Please repeat your question in a moment or consult verified classical references.\n\n"
            "*And Allah (Subhanahu wa Ta'ala) knows best.*"
        )
    
    quran_snippets = []
    hadith_snippets = []
    other_snippets = []
    
    for src in rag_sources:
        text = src.strip()
        text_lower = text.lower()
        if "quran" in text_lower or "surah" in text_lower or "ayah" in text_lower:
            quran_snippets.append(text)
        elif "hadith" in text_lower or "bukhari" in text_lower or "muslim" in text_lower or "prophet" in text_lower:
            hadith_snippets.append(text)
        else:
            other_snippets.append(text)
            
    parts = []
    parts.append("As-salamu alaykum wa rahmatullahi wa barakatuh.\n")
    parts.append(f"Regarding your inquiry: **\"{question}\"**, here is authentic guidance derived directly from our verified Islamic knowledge sources:\n")
    
    if quran_snippets:
        parts.append("### 📖 Divine Wisdom & Quranic Evidence")
        for qs in quran_snippets[:2]:
            lines = qs.split("\n")
            header = lines[0] if lines else "Quranic Reference"
            body = " ".join(lines[1:]) if len(lines) > 1 else qs
            parts.append(f"[QURAN]{body}[/QURAN]\n*Reference: {header}*\n")
            
    if hadith_snippets:
        parts.append("### 📜 Prophetic Guidance & Hadith Evidence")
        for hs in hadith_snippets[:2]:
            lines = hs.split("\n")
            header = lines[0] if lines else "Prophetic Narration"
            body = " ".join(lines[1:]) if len(lines) > 1 else hs
            parts.append(f"The Messenger of Allah (ﷺ) taught:\n[HADITH]{body}[/HADITH]\n*Source: {header}*\n")
            
    if other_snippets or (not quran_snippets and not hadith_snippets):
        parts.append("### ⚖️ Scholarly Perspectives & Juristic Analysis")
        for os_text in (other_snippets or rag_sources)[:2]:
            parts.append(f"{os_text}\n")
            
    parts.append("### 💡 Practical Takeaways & Daily Application")
    parts.append("- Reflect on the authentic evidences and align your actions with sincere intention (Ikhlas).")
    parts.append("- For personal legal, marital, or binding fatwas, always consult a qualified local scholar.\n")
    
    parts.append("May Allah guide our hearts, grant us beneficial knowledge, and keep us steadfast on the Straight Path.\n\n*And Allah (Subhanahu wa Ta'ala) knows best.*")
    
    return "\n\n".join(parts)

# ===== COMPLEX QUESTION DETECTION =====
def is_complex_fiqh_question(question: str) -> bool:
    """Detect if a question requires complex fiqh analysis"""
    question_lower = question.lower()
    
    complex_indicators = [
        'ruling on', 'according to hanafi', 'hanafi school', 'school of thought',
        'fiqh ruling', 'is it permissible', 'is it allowed', 'halal or haram',
        'what is the hukum', 'is it valid', 'detailed ruling', 'jurisprudential',
        'classical opinion', 'scholarly opinion', 'madhab', 'madhhab',
        'is it makruh', 'is it wajib', 'is it sunnah', 'what is the daleel',
        'evidences for', 'proofs for', 'islamic ruling', 'shariah ruling',
        'what does hanafi', 'hanafi position', 'hanafi view', 'fiqh opinion'
    ]
    
    complex_topics = [
        'mourning', 'grief', 'black color', 'clothing color', 'customs',
        'inheritance', 'financial rulings', 'marriage conditions',
        'divorce procedures', 'prayer validity', 'fasting compensation',
        'zakat calculation', 'business transactions', 'medical issues',
        'funeral rites', 'mourning period', 'iddah', 'menstruation',
        'post-natal bleeding', 'janabah', 'tayammum', 'qada prayer',
        'interest', 'riba', 'insurance', 'banking', 'investments',
        'salah', 'wudu', 'ghusl', 'taharah', 'halal food', 'slaughter',
        'financial', 'business', 'trade', 'contract', 'loan'
    ]
    
    has_complex_indicator = any(indicator in question_lower for indicator in complex_indicators)
    has_complex_topic = any(topic in question_lower for topic in complex_topics)
    is_complex_phrasing = len(question.split()) > 6 and any(word in question_lower for word in ['fiqh', 'ruling', 'permissible', 'hanafi', 'shafi', 'maliki'])
    
    return has_complex_indicator or has_complex_topic or is_complex_phrasing

def requires_detailed_fiqh(question: str) -> bool:
    """Check if question requires detailed fiqh analysis"""
    question_lower = question.lower()
    detailed_fiqh_indicators = [
        'detailed ruling', 'evidences', 'proofs', 'daleel', 'evidence from quran',
        'hadith evidence', 'scholarly opinions', 'difference of opinion',
        'classical texts', 'jurisprudential reasoning', 'with proofs',
        'with evidences', 'with daleel', 'quranic evidence', 'hadith proof',
        'comprehensive ruling', 'full explanation'
    ]
    return any(indicator in question_lower for indicator in detailed_fiqh_indicators)

# ===== PROMPT SELECTION & ENRICHMENT =====
def get_prompt_for_question(question: str, context: str, context_quality: str = "good", conversation_history: list = None) -> str:
    """
    Select and assemble the enriched prompt based on RAG context quality, question type,
    and conversation history, ensuring the answer design strictly follows the unified template.
    Places conversation memory BEFORE the current question so the model never loses context.
    """
    # 1. Build conversation memory block placed BEFORE the question
    history_block = ""
    if conversation_history and len(conversation_history) > 0:
        history_lines = []
        for msg in conversation_history[-10:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "").strip()
            clean_content = re.sub(r'\[\/?(QURAN|HADITH)\]', '', content)
            if len(clean_content) > 400:
                clean_content = clean_content[:400] + "..."
            history_lines.append(f"{role}: {clean_content}")
            
        history_block = (
            "==================================================\n"
            "ACTIVE CONVERSATION MEMORY (Chronological dialogue in this session):\n"
            + "\n".join(history_lines) +
            "\n==================================================\n"
            "CRITICAL CONVERSATIONAL INSTRUCTION:\n"
            "- The user's current inquiry below is a direct continuation of this dialogue.\n"
            "- You MUST resolve pronouns ('he', 'him', 'his', 'she', 'her', 'they', 'them', 'it', 'this', 'that', 'who killed him', etc.) "
            "directly to the subject discussed in the conversation history above.\n"
            "- Never lose track of who or what is being discussed in this conversation.\n"
            "- If the retrieved RAG context does not mention the subject or is about a different topic, DO NOT force an answer from it. "
            "Instead, rely on verified authentic Islamic history, Quran, and Sahih Hadith to accurately answer the question."
        )

    # 2. Select specialized base prompt based on inquiry classification
    if requires_detailed_fiqh(question):
        base_prompt = PROMPT_DETAILED_FIQH.format(question=question, context=context or "Refer to classical scholarly consensus and primary texts.")
    elif is_complex_fiqh_question(question):
        base_prompt = PROMPT_COMPLEX_FIQH.format(question=question, context=context or "Refer to classical jurisprudential consensus and primary sources.")
    else:
        q_type = _classify_question_type(question)
        if q_type == "current_events":
            base_prompt = PROMPT_CURRENT_EVENTS.format(context=context or "Apply timeless Quranic and Sunnah ethical principles.", question=question)
        elif q_type == "historical":
            base_prompt = PROMPT_HISTORICAL.format(context=context or "Draw upon authentic Seerah and Islamic historical records.", question=question)
        elif q_type == "ethical_dilemma":
            base_prompt = PROMPT_ETHICAL_DILEMMA.format(context=context or "Ground in Maqasid al-Shariah and Prophetic ethics.", question=question)
        elif context and context.strip() and context_quality in ["rich", "good", "minimal"]:
            base_prompt = PROMPT_WITH_CONTEXT.format(context=context, question=question)
        else:
            base_prompt = PROMPT_WITHOUT_CONTEXT.format(question=question)

    # 3. Add topic guidance if applicable
    topic_guidance = _get_topic_guidance(question)
    topic_text = f"SPECIFIC TOPIC EMPHASIS: {topic_guidance}" if topic_guidance else ""

    # Clean any trailing "Answer:" from base_prompt so we append it cleanly at the very end
    cleaned_base = re.sub(r'\n*Answer:\s*$', '', base_prompt.strip())

    # 4. Assemble final prompt with memory before the question and Answer: at the bottom
    prompt_sections = [SYSTEM_BASE]
    if history_block:
        prompt_sections.append(history_block)
    prompt_sections.append(cleaned_base)
    if topic_text:
        prompt_sections.append(topic_text)
    prompt_sections.append("Answer:")

    return "\n\n".join(prompt_sections)

def _classify_question_type(question: str) -> str:
    """Classify the type of question for specialized handling"""
    question_lower = question.lower()
    
    current_events_keywords = [
        'current', 'recent', 'news', 'today', 'nowadays', 'modern', 'contemporary',
        'palestine', 'gaza', 'israel', 'conflict', 'war', 'crisis', 'political',
        'climate change', 'global warming', 'technology', 'social media', 'internet', 'ai'
    ]
    historical_keywords = [
        'history', 'historical', 'past', 'century', 'caliphate', 'companion', 'sahaba',
        'battle of', 'seerah', 'prophet lived', 'golden age', 'ottoman'
    ]
    ethical_keywords = [
        'should i', 'what should i do', 'ethical', 'moral', 'dilemma',
        'is it right to', 'is it moral', 'conscience', 'guilt', 'conflict'
    ]
    
    if any(k in question_lower for k in current_events_keywords):
        return "current_events"
    elif any(k in question_lower for k in historical_keywords):
        return "historical"
    elif any(k in question_lower for k in ethical_keywords):
        return "ethical_dilemma"
    return "general"

def _get_topic_guidance(question: str) -> str:
    """Get topic-specific guidance for the prompt"""
    question_lower = question.lower()
    
    for topic, guidance in TOPIC_SPECIFIC_PROMPTS.items():
        if topic in question_lower:
            return guidance
            
    keyword_mappings = {
        'prayer': ['prayer', 'salah', 'namaz', 'salat', 'rakat', 'sujood', 'ruku'],
        'fasting': ['fast', 'ramadan', 'sawm', 'roza', 'iftar', 'suhoor'],
        'zakat': ['zakat', 'charity', 'sadaqah', 'nisab'],
        'hajj': ['hajj', 'pilgrimage', 'umrah', 'tawaf'],
        'family': ['marriage', 'divorce', 'family', 'parent', 'child', 'wife', 'husband', 'nikah'],
        'business': ['business', 'money', 'trade', 'work', 'job', 'income', 'halal income', 'crypto', 'loan'],
        'health': ['health', 'medical', 'medicine', 'sick', 'illness', 'treatment', 'depression', 'anxiety'],
        'fiqh': ['ruling', 'hanafi', 'school of thought', 'fiqh', 'permissible', 'haram', 'halal']
    }
    
    for topic, keywords in keyword_mappings.items():
        if any(keyword in question_lower for keyword in keywords):
            return TOPIC_SPECIFIC_PROMPTS.get(topic, "")
            
    return ""

def format_final_response(answer: str, response_type: str = "success_general", **kwargs) -> str:
    """Format the final response using templates"""
    if response_type in RESPONSE_TEMPLATES:
        if response_type == "fallback":
            return RESPONSE_TEMPLATES["fallback"].format(
                question=kwargs.get('question', ''),
                general_guidance=kwargs.get('general_guidance', '')
            )
        else:
            return RESPONSE_TEMPLATES[response_type].format(answer=answer)
    return answer

def get_response_type_for_question(question: str) -> str:
    """Get the appropriate response type for a question"""
    if is_complex_fiqh_question(question):
        return "complex_fiqh"
    elif requires_detailed_fiqh(question):
        return "detailed_fiqh"
    
    q_type = _classify_question_type(question)
    if q_type == "current_events":
        return "current_events"
    elif q_type == "historical":
        return "historical"
    elif q_type == "ethical_dilemma":
        return "ethical"
    return "success_general"
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", 
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", 
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", 
    "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", 
    "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", 
    "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", 
    "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", 
    "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", 
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", 
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", 
    "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", 
    "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", 
    "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", 
    "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", 
    "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

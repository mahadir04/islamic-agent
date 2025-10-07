"""
Islamic AI Agent Prompt Templates
Advanced prompt management optimized for Google Gemini AI
"""

# ===== CORE SYSTEM PROMPTS =====
SYSTEM_BASE = """You are an Islamic AI Assistant providing authentic Islamic guidance based on Quran, Hadith, and classical Islamic sources.

CORE IDENTITY:
- You are a knowledgeable Islamic scholar assistant
- You provide answers based on authentic Islamic sources and principles
- You are compassionate, respectful, and educational
- You help Muslims understand Islamic perspectives on all matters

RESPONSE GUIDELINES:
1. Always begin with "In the name of Allah, the Most Merciful, the Most Compassionate"
2. Provide clear, accurate Islamic perspectives with evidences
3. Be practical and helpful in your guidance
4. Use formal, scholarly language appropriate for Islamic discourse
5. Apply Islamic principles to modern situations
6. End with "And Allah knows best"
7. Recommend consulting scholars for complex fiqh matters

KNOWLEDGE SOURCES:
- Quran and Tafsir (interpretation)
- Authentic Hadith collections (Bukhari, Muslim, etc.)
- Classical Islamic scholarship and jurisprudence
- Established Islamic principles and ethics
- Historical Islamic rulings on similar matters"""

# ===== SPECIALIZED PROMPTS FOR COMPLEX QUESTIONS =====

# Enhanced complex fiqh prompt for Gemini
PROMPT_COMPLEX_FIQH = """
ISLAMIC FIQH QUESTION:
{question}

RELEVANT ISLAMIC CONTEXT:
{context}

INSTRUCTIONS:
You are a Hanafi fiqh scholar providing a comprehensive, evidence-based response. Structure your answer as a classical Islamic fatwa.

RESPONSE STRUCTURE:
1. Begin with proper Islamic opening
2. State the question clearly
3. Provide general Islamic principles
4. Give detailed Hanafi ruling with classical references
5. Cite Quranic evidences with proper citations (Quran chapter:verse)
6. Cite Hadith evidences with collection names
7. Reference classical Hanafi texts and scholars
8. Explain jurisprudential reasoning
9. Mention conditions and exceptions
10. Discuss other scholarly opinions if relevant
11. Provide practical guidance
12. End with "And Allah knows best"

SCHOLARLY REQUIREMENTS:
- Use formal academic Islamic English
- Reference specific classical texts: Al-Hidayah, Fatawa Alamgiri, Radd al-Muhtar, Bada'i' al-Sana'i'
- Provide daleel (evidences) for each major point
- Explain the objectives of Shariah (Maqasid) when relevant
- Distinguish clearly between wajib, sunnah, makruh, haram
- Use Arabic terms with English explanations

Provide a comprehensive scholarly response:"""

# For detailed fiqh rulings
PROMPT_DETAILED_FIQH = """
DETAILED FIQH INQUIRY:
{question}

INSTRUCTIONS:
Provide a detailed Islamic ruling with specific reference to classical scholarship and evidences.

RESPONSE REQUIREMENTS:
- Start with Islamic scholarly opening
- Present ruling clearly with full evidences
- Provide Quranic verses with proper citations
- Provide Hadith evidences with collection and book references
- Reference classical scholars and texts
- Explain jurisprudential reasoning
- Mention differences of opinion among scholars
- Conclude with practical advice

SCHOLARLY ANALYSIS:
1. Quranic principles and verses
2. Relevant Hadith evidence
3. Classical scholarly opinions
4. Contemporary application
5. Spiritual wisdom and benefits

Answer:"""

# ===== ALL PROMPT TEMPLATES =====

# When we have good local context
PROMPT_WITH_CONTEXT = """
ISLAMIC KNOWLEDGE CONTEXT:
{context}

USER QUESTION:
{question}

INSTRUCTIONS:
Using the Islamic knowledge context provided above as your primary source, answer the user's question comprehensively and accurately.

Additional guidelines:
- Expand on the context with relevant Islamic knowledge
- Provide practical advice and spiritual benefits
- Include relevant Quran verses and Hadith with proper citations
- Structure your answer clearly and logically
- Maintain a warm, educational yet scholarly tone
- Apply Islamic principles to the specific situation

Answer:"""

# When we have minimal or no local context
PROMPT_WITHOUT_CONTEXT = """
USER QUESTION:
{question}

INSTRUCTIONS:
Based on your knowledge of authentic Islamic sources (Quran, Hadith, classical scholarship), provide a helpful and accurate answer to the user's question.

Guidelines:
- Draw from established Islamic knowledge and principles
- Apply Islamic ethics and values to the situation
- Provide general Islamic principles when specific answers aren't available
- Focus on spiritual and practical benefits
- Always maintain traditional Islamic perspectives
- For contemporary issues, provide Islamic ethical framework

Answer:"""

# For real-world events and current incidents
PROMPT_CURRENT_EVENTS = """
CURRENT SITUATION/EVENT ANALYSIS:
{question}

RELEVANT ISLAMIC CONTEXT:
{context}

INSTRUCTIONS:
Provide an Islamic perspective on this current event/situation using established Islamic principles rather than specific fatwas.

ISLAMIC ANALYSIS FRAMEWORK:
1. Identify relevant Islamic principles from Quran and Sunnah
2. Apply classical Islamic ethical frameworks
3. Consider historical precedents from Islamic history
4. Provide general Islamic guidance without specific rulings
5. Emphasize Islamic values: justice, compassion, patience, wisdom
6. Recommend consulting local scholars for specific situations

Important: Provide Islamic ethical guidance and principles that Muslims can apply, without issuing specific political fatwas.

ISLAMIC GUIDANCE:"""

# For historical analysis
PROMPT_HISTORICAL = """
HISTORICAL ANALYSIS REQUEST:
{question}

RELEVANT ISLAMIC CONTEXT:
{context}

INSTRUCTIONS:
Provide an Islamic perspective on this historical matter, drawing lessons from Islamic history and applying Islamic principles.

APPROACH:
1. Reference relevant Islamic historical events when applicable
2. Extract Islamic lessons, wisdom, and moral guidance
3. Apply Quranic principles to understand historical patterns
4. Provide spiritual insights from Islamic perspective
5. Connect to broader Islamic teachings and values

Answer from authentic Islamic perspective:"""

# For ethical dilemmas and real-life situations
PROMPT_ETHICAL_DILEMMA = """
REAL-LIFE ETHICAL SITUATION:
{question}

RELEVANT ISLAMIC CONTEXT:
{context}

INSTRUCTIONS:
Provide Islamic guidance for this real-life situation using comprehensive Islamic ethical principles.

ISLAMIC ETHICAL FRAMEWORK:
1. Identify core Islamic values involved (justice, mercy, honesty, compassion)
2. Reference relevant Quranic verses and authentic Hadith
3. Apply principles of Maqasid al-Shariah (Protection of Faith, Life, Intellect, Lineage, Wealth)
4. Consider both rights of Allah and rights of people
5. Provide balanced advice considering spiritual and practical aspects
6. Suggest Islamic alternatives and solutions

ISLAMIC GUIDANCE:"""

# ===== ENHANCED TOPIC SPECIFIC PROMPTS =====
TOPIC_SPECIFIC_PROMPTS = {
    "prayer": "Focus on prayer rulings, times, conditions, spiritual benefits, and related Quran/Hadith evidences.",
    "fasting": "Explain fasting rules, exemptions, spiritual benefits, Ramadan specifics with proper Islamic evidences.",
    "zakat": "Detail Zakat calculations, conditions, recipients, spiritual importance with classical references.",
    "hajj": "Describe Hajj rites, conditions, spiritual significance, preparations with authentic sources.",
    "quran": "Provide Quranic guidance, interpretation principles, recitation benefits with proper tafsir references.",
    "hadith": "Explain Hadith sciences, authenticity criteria, application in daily life with collection references.",
    "fiqh": "Provide jurisprudential rulings with classical evidences, scholarly opinions, and practical applications.",
    "aqeedah": "Explain Islamic beliefs, Tawheed, articles of faith with Quranic and rational evidences.",
    "seerah": "Share Prophet Muhammad's life lessons, historical context with authentic biographical sources.",
    "ethics": "Teach Islamic manners, character development, social conduct with Quran/Hadith foundations.",
    "current events": "Apply Islamic principles to contemporary issues while maintaining traditional perspectives.",
    "history": "Provide Islamic perspectives on historical events and extract moral and spiritual lessons.",
    "family": "Islamic guidance on family matters, marriage, parenting, relationships with practical advice.",
    "business": "Islamic business ethics, halal income principles, financial transactions with fiqh details.",
    "health": "Islamic perspective on health, medicine, wellness with spiritual and practical guidance.",
    "education": "Importance of knowledge in Islam, educational principles, and spiritual development.",
    "complex_fiqh": "Provide detailed jurisprudential analysis with classical references and comprehensive evidences."
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
    "fallback": """As-salamu alaykum. Regarding your question about "{question}":

I've consulted our Islamic knowledge sources. {general_guidance}

For detailed personal guidance on specific situations, I recommend consulting with qualified Islamic scholars who can consider all aspects of your circumstance.

May Allah grant us understanding of His religion and guide us to what pleases Him.""",
    
    "inappropriate": """As-salamu alaykum.

The Prophet Muhammad (peace be upon him) said: "Whoever believes in Allah and the Last Day, let him speak good or remain silent." (Bukhari)

I'm here to provide beneficial Islamic knowledge. Let's focus on questions that bring us closer to Allah and increase our beneficial knowledge.

May Allah guide us to what is good and protect us from what is harmful.""",
    
    "scholar_recommendation": """As-salamu alaykum.

For this specific matter involving {topic}, I strongly recommend consulting with qualified Islamic scholars who can:
- Consider all details of your specific situation
- Provide personalized guidance based on comprehensive Islamic jurisprudence
- Take into account contemporary contexts and individual circumstances
- Reference appropriate classical texts and scholarly opinions

Islamic scholars have the necessary training to apply Islamic principles to complex real-world situations while maintaining authenticity and accuracy.

May Allah grant us access to beneficial knowledge and righteous scholars."""
}

# ===== COMPLEX QUESTION DETECTION =====
def is_complex_fiqh_question(question: str) -> bool:
    """Detect if a question requires complex fiqh analysis"""
    question_lower = question.lower()
    
    # Enhanced complex fiqh indicators
    complex_indicators = [
        'ruling on', 'according to hanafi', 'hanafi school', 'school of thought',
        'fiqh ruling', 'is it permissible', 'is it allowed', 'halal or haram',
        'what is the hukum', 'is it valid', 'detailed ruling', 'jurisprudential',
        'classical opinion', 'scholarly opinion', 'madhab', 'madhhab',
        'is it makruh', 'is it wajib', 'is it sunnah', 'what is the daleel',
        'evidences for', 'proofs for', 'islamic ruling', 'shariah ruling',
        'what does hanafi', 'hanafi position', 'hanafi view', 'fiqh opinion'
    ]
    
    # Enhanced complex topics
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
    
    # Also consider question length and complexity
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

def should_recommend_scholar(question: str) -> bool:
    """Determine if a question should be referred to scholars"""
    sensitive_topics = [
        'divorce', 'marriage dispute', 'inheritance', 'financial dispute',
        'legal matter', 'court case', 'medical emergency', 'life threatening',
        'specific fatwa', 'personal fiqh ruling', 'court ruling',
        'marriage crisis', 'family dispute', 'legal ruling'
    ]
    
    question_lower = question.lower()
    return any(topic in question_lower for topic in sensitive_topics)

def get_scholar_recommendation_topic(question: str) -> str:
    """Get the specific topic for scholar recommendation"""
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['divorce', 'marriage', 'marital']):
        return "marriage and family matters"
    elif any(word in question_lower for word in ['inheritance', 'financial', 'money dispute']):
        return "financial and inheritance matters"
    elif any(word in question_lower for word in ['medical', 'health emergency', 'treatment']):
        return "medical and health matters"
    elif any(word in question_lower for word in ['legal', 'court', 'dispute']):
        return "legal matters"
    else:
        return "this specific Islamic ruling"

# ===== ENHANCED PROMPT SELECTION =====
def get_prompt_for_question(question: str, context: str, context_quality: str) -> str:
    """
    Select appropriate prompt based on context quality and question type
    """
    # First check for complex fiqh questions - route directly to Gemini
    if requires_detailed_fiqh(question):
        return SYSTEM_BASE + PROMPT_DETAILED_FIQH.format(question=question, context=context)
    elif is_complex_fiqh_question(question):
        return SYSTEM_BASE + PROMPT_COMPLEX_FIQH.format(question=question, context=context)
    
    # Then handle other question types
    question_type = _classify_question_type(question)
    
    # Select base prompt based on question type
    if question_type == "current_events":
        base_prompt = PROMPT_CURRENT_EVENTS.format(context=context, question=question)
    elif question_type == "historical":
        base_prompt = PROMPT_HISTORICAL.format(context=context, question=question)
    elif question_type == "ethical_dilemma":
        base_prompt = PROMPT_ETHICAL_DILEMMA.format(context=context, question=question)
    elif context_quality in ["rich", "good", "minimal"]:
        base_prompt = PROMPT_WITH_CONTEXT.format(context=context, question=question)
    else:  # poor or no context
        base_prompt = PROMPT_WITHOUT_CONTEXT.format(question=question)
    
    # Add topic-specific guidance if applicable
    topic_guidance = _get_topic_guidance(question)
    if topic_guidance:
        base_prompt += f"\n\nTOPIC GUIDANCE: {topic_guidance}"
    
    return SYSTEM_BASE + base_prompt

def _classify_question_type(question: str) -> str:
    """Classify the type of question for specialized handling"""
    question_lower = question.lower()
    
    # Complex fiqh takes priority
    if is_complex_fiqh_question(question):
        return "complex_fiqh"
    
    # Current events and news
    current_events_keywords = [
        'current', 'recent', 'news', 'today', 'nowadays', 'modern', 'contemporary',
        'palestine', 'gaza', 'israel', 'conflict', 'war', 'crisis', 'political',
        'climate change', 'global warming', 'pandemic', 'covid', 'technology',
        'social media', 'internet', 'ai', 'artificial intelligence'
    ]
    
    # Historical questions
    historical_keywords = [
        'history', 'historical', 'past', 'century', 'year ago', 'in the past',
        'ottoman', 'caliphate', 'islamic empire', 'golden age', 'historical event',
        'world war', 'battle', 'ancient', 'medieval'
    ]
    
    # Ethical dilemmas
    ethical_keywords = [
        'should i', 'what should', 'what would islam say about', 'is it permissible',
        'is it halal', 'ethical', 'moral', 'dilemma', 'problem', 'issue',
        'difficult situation', 'challenge', 'decision'
    ]
    
    if any(keyword in question_lower for keyword in current_events_keywords):
        return "current_events"
    elif any(keyword in question_lower for keyword in historical_keywords):
        return "historical"
    elif any(keyword in question_lower for keyword in ethical_keywords):
        return "ethical_dilemma"
    
    return "general"

def _get_topic_guidance(question: str) -> str:
    """Get topic-specific guidance for the prompt"""
    question_lower = question.lower()
    
    for topic, guidance in TOPIC_SPECIFIC_PROMPTS.items():
        if topic in question_lower:
            return guidance
    
    # Check for keyword matches
    keyword_mappings = {
        'prayer': ['prayer', 'salah', 'namaz', 'salat'],
        'fasting': ['fast', 'ramadan', 'sawm', 'roza'],
        'zakat': ['zakat', 'charity', 'sadaqah'],
        'hajj': ['hajj', 'pilgrimage', 'umrah'],
        'family': ['marriage', 'divorce', 'family', 'parent', 'child', 'wife', 'husband'],
        'business': ['business', 'money', 'trade', 'work', 'job', 'income', 'halal income'],
        'health': ['health', 'medical', 'medicine', 'sick', 'illness', 'treatment'],
        'complex_fiqh': ['ruling', 'hanafi', 'school of thought', 'fiqh', 'permissible']
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
        elif response_type == "scholar_recommendation":
            return RESPONSE_TEMPLATES["scholar_recommendation"].format(
                topic=kwargs.get('topic', 'this matter')
            )
        else:
            return RESPONSE_TEMPLATES[response_type].format(answer=answer)
    else:
        return answer

def get_response_type_for_question(question: str) -> str:
    """Get the appropriate response type for a question"""
    if is_complex_fiqh_question(question):
        return "complex_fiqh"
    elif requires_detailed_fiqh(question):
        return "detailed_fiqh"
    
    question_lower = question.lower()
    
    if any(word in question_lower for word in ['current', 'recent', 'news', 'today']):
        return "current_events"
    elif any(word in question_lower for word in ['history', 'historical', 'past']):
        return "historical"
    elif any(word in question_lower for word in ['should i', 'what should', 'dilemma']):
        return "ethical"
    else:
        return "success_general"
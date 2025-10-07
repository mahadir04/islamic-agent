import os
import re
from collections import Counter

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class EnhancedRetriever:
    """Enhanced retriever that searches local Islamic knowledge files"""
    
    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()
        self.keyword_mappings = self._get_keyword_mappings()
        print(f"✅ EnhancedRetriever initialized with {len(self.knowledge_base)} knowledge entries")
    
    def _build_knowledge_base(self):
        """Build Islamic knowledge base from data files"""
        knowledge = []
        
        if os.path.exists(DATA_DIR):
            print(f"📁 Loading data from {DATA_DIR}...")
            for fname in os.listdir(DATA_DIR):
                if fname.endswith((".txt", ".md")):
                    try:
                        file_path = os.path.join(DATA_DIR, fname)
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read().strip()
                            if content:
                                # Split content into smaller chunks for better matching
                                chunks = self._split_into_chunks(content, fname)
                                knowledge.extend(chunks)
                                print(f"   ✅ Loaded {len(chunks)} chunks from {fname}")
                    except Exception as e:
                        print(f"   ❌ Error reading {fname}: {e}")
        else:
            print(f"❌ Data directory {DATA_DIR} not found")
        
        # Add default knowledge if no files found or empty
        if not knowledge:
            print("📚 Creating default Islamic knowledge base...")
            knowledge = self._get_default_islamic_knowledge()
        
        return knowledge
    
    def _split_into_chunks(self, content, source, chunk_size=300):
        """Split content into smaller chunks for better matching"""
        # Split by sentences first
        sentences = re.split(r'[.!?]+', content)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += " " + sentence if current_chunk else sentence
            else:
                if current_chunk:
                    chunks.append(f"📖 {source}\n{current_chunk.strip()}")
                current_chunk = sentence
        
        if current_chunk:
            chunks.append(f"📖 {source}\n{current_chunk.strip()}")
        
        return chunks
    
    def _get_keyword_mappings(self):
        """Define keyword mappings for better retrieval"""
        return {
            'prayer': ['prayer', 'salah', 'namaz', 'salat', 'rakat', 'rakah', 'worship', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'sujud', 'ruku'],
            'fasting': ['fasting', 'fast', 'ramadan', 'sawm', 'roza', 'iftar', 'suhoor', 'sehri', 'tarawih'],
            'zakat': ['zakat', 'charity', 'sadaqah', 'poor', 'wealth', 'money', 'donation', 'nisab', 'fitrah'],
            'hajj': ['hajj', 'pilgrimage', 'mecca', 'kaaba', 'umrah', 'tawaf', 'saee', 'arafat', 'muzdalifah', 'jamarat'],
            'wudu': ['wudu', 'ablution', 'purification', 'wash', 'clean', 'taharat', 'ghusl', 'tayammum'],
            'quran': ['quran', 'koran', 'surah', 'ayat', 'verse', 'revelation', 'recitation', 'memorization'],
            'hadith': ['hadith', 'prophet', 'muhammad', 'sunnah', 'narration', 'bukhari', 'muslim', 'tirmidhi'],
            'islam': ['islam', 'muslim', 'faith', 'religion', 'belief', 'iman', 'tawheed', 'shahada'],
            'fiqh': ['fiqh', 'jurisprudence', 'halal', 'haram', 'fatwa', 'ruling', 'hanafi', 'shafi', 'maliki', 'hanbali'],
            'seerah': ['seerah', 'biography', 'prophet life', 'migration', 'hijra', 'medina', 'mecca']
        }
    
    def search_local_knowledge(self, question, max_results=5):
        """Search local knowledge base for relevant answers"""
        question_lower = question.lower()
        question_words = set(re.findall(r'\b\w+\b', question_lower))
        
        scored_results = []
        
        for entry in self.knowledge_base:
            score = 0
            entry_lower = entry.lower()
            
            # Exact word matching
            for word in question_words:
                if len(word) > 3 and word in entry_lower:  # Only words longer than 3 chars
                    score += 3
            
            # Category matching
            for category, keywords in self.keyword_mappings.items():
                category_match = any(keyword in question_lower for keyword in keywords)
                if category_match:
                    # Bonus if entry contains category keywords
                    entry_category_match = any(keyword in entry_lower for keyword in keywords)
                    if entry_category_match:
                        score += 10
            
            # Source relevance
            if 'quran' in question_lower and 'quran' in entry_lower:
                score += 5
            if 'hadith' in question_lower and 'hadith' in entry_lower:
                score += 5
            if 'prophet' in question_lower and ('prophet' in entry_lower or 'muhammad' in entry_lower):
                score += 5
            
            if score > 0:
                scored_results.append((score, entry))
        
        # Sort by score and return top results
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [result[1] for result in scored_results[:max_results]]
    
    def _get_default_islamic_knowledge(self):
        """Default Islamic knowledge base"""
        return [
            "📖 quran.txt\nQur'an 1:1-7 - Al-Fatihah (The Opening): In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is for Allah—Lord of all worlds.",
            "📖 quran.txt\nQur'an 2:255 - Ayat al-Kursi: Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
            "📖 quran.txt\nQur'an 112:1-4 - Al-Ikhlas: Say, He is Allah, the One. Allah, the Eternal Refuge.",
            "📖 hadith_bukhari.txt\nHadith: The Prophet Muhammad (peace be upon him) said: 'Actions are judged by intentions.' (Sahih al-Bukhari 1)",
            "📖 hadith_bukhari.txt\nHadith: 'Seeking knowledge is obligatory for every Muslim.' (Sunan Ibn Majah 224)",
            "📖 hadith_muslim.txt\nHadith: 'None of you truly believes until he loves for his brother what he loves for himself.' (Sahih al-Bukhari 13)",
            "📖 fiqh_hanafi.txt\nFive Pillars of Islam: Shahadah (Faith), Salah (Prayer), Zakat (Charity), Sawm (Fasting), Hajj (Pilgrimage).",
            "📖 fiqh_hanafi.txt\nPrayer Times: Fajr (dawn), Dhuhr (midday), Asr (afternoon), Maghrib (sunset), Isha (night).",
            "📖 seerah.txt\nThe Prophet Muhammad (peace be upon him) was born in Mecca in 570 CE. Received first revelation at age 40. Hijra to Medina in 622 CE."
        ]
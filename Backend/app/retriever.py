import os
import re

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
                                chunks = self._split_into_chunks(content, fname)
                                knowledge.extend(chunks)
                                print(f"   ✅ Loaded {len(chunks)} chunks from {fname}")
                    except Exception as e:
                        print(f"   ❌ Error reading {fname}: {e}")
        else:
            print(f"❌ Data directory {DATA_DIR} not found")
        
        if not knowledge:
            print("📚 Creating default Islamic knowledge base...")
            knowledge = self._get_default_islamic_knowledge()
        
        return knowledge
    
    def _split_into_chunks(self, content, source, chunk_size=400):
        """Split content intelligently preserving verses and paragraphs"""
        chunks = []

        # 1. Specialized chunking for quran.txt: Group 3-5 consecutive verses with header
        if source == "quran.txt":
            sections = content.split("\n\n")
            for sec in sections:
                lines = [l.strip() for l in sec.split("\n") if l.strip()]
                if not lines:
                    continue
                header = lines[0] if lines[0].startswith("Surah") else "Quran Verse"
                verses = lines[1:] if lines[0].startswith("Surah") else lines
                
                # Group verses in groups of 3 to 5
                batch = []
                batch_len = 0
                for v in verses:
                    batch.append(v)
                    batch_len += len(v)
                    if batch_len >= chunk_size or len(batch) >= 4:
                        chunks.append(f"📖 {source} ({header})\n" + "\n".join(batch))
                        batch = []
                        batch_len = 0
                if batch:
                    chunks.append(f"📖 {source} ({header})\n" + "\n".join(batch))
            return chunks

        # 2. Specialized chunking for hadith_bukhari.txt: Keep complete Hadith units
        if source == "hadith_bukhari.txt":
            hadiths = content.split("\n\n")
            for h in hadiths:
                h_clean = h.strip()
                if h_clean:
                    chunks.append(f"📖 {source}\n{h_clean}")
            return chunks

        # 3. For fiqh, seerah, fatwa: split by logical double newline sections / topics
        sections = content.split("\n\n")
        current_chunk = ""
        for sec in sections:
            sec = sec.strip()
            if not sec:
                continue
            if len(current_chunk) + len(sec) < chunk_size:
                current_chunk += "\n\n" + sec if current_chunk else sec
            else:
                if current_chunk:
                    chunks.append(f"📖 {source}\n{current_chunk.strip()}")
                current_chunk = sec
        
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
            'seerah': ['seerah', 'biography', 'prophet life', 'migration', 'hijra', 'medina', 'mecca', 'badr', 'uhud', 'khandaq']
        }
    
    def search_local_knowledge(self, question, max_results=5):
        """Search local knowledge base for relevant answers with exact citations and keywords"""
        question_lower = question.lower()
        question_words = set(re.findall(r'\b\w+\b', question_lower))
        
        # Check for explicit Quran chapter:verse citation like 20:44 or 2:255
        verse_refs = re.findall(r'(\d+):(\d+)', question_lower)
        
        scored_results = []
        
        for entry in self.knowledge_base:
            score = 0
            entry_lower = entry.lower()
            
            # 1. Exact verse citation matching (e.g. "Quran 20:44")
            for ch, vs in verse_refs:
                pat = f"quran {ch}:{vs}"
                pat_alt = f"{ch}:{vs}"
                if pat in entry_lower or pat_alt in entry_lower:
                    score += 150
            
            # 2. Exact word matching
            for word in question_words:
                if len(word) > 2 and word in entry_lower:
                    score += 3
            
            # 3. Category matching
            for category, keywords in self.keyword_mappings.items():
                category_match = any(keyword in question_lower for keyword in keywords)
                if category_match:
                    entry_category_match = any(keyword in entry_lower for keyword in keywords)
                    if entry_category_match:
                        score += 10
            
            # 4. Source relevance
            if 'quran' in question_lower and 'quran.txt' in entry_lower:
                score += 8
            if 'hadith' in question_lower and 'hadith_bukhari.txt' in entry_lower:
                score += 8
            if 'prophet' in question_lower and ('seerah.txt' in entry_lower or 'hadith_bukhari.txt' in entry_lower):
                score += 6
            if 'fatwa' in question_lower and 'fatwa_islamqa.md' in entry_lower:
                score += 8
            if 'fiqh' in question_lower and 'fiqh_hanafi.txt' in entry_lower:
                score += 8
            
            if score > 0:
                scored_results.append((score, entry))
        
        # Sort by score and return top results
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [result[1] for result in scored_results[:max_results]]
    
    def _get_default_islamic_knowledge(self):
        """Default Islamic knowledge base"""
        return [
            "📖 quran.txt\nQur'an 1:1-7 - Al-Fatihah (The Opening): In the name of Allah, the Entirely Merciful, the Especially Merciful.",
            "📖 quran.txt\nQur'an 2:255 - Ayat al-Kursi: Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
            "📖 hadith_bukhari.txt\nHadith: The Prophet Muhammad (peace be upon him) said: 'Actions are judged by intentions.' (Sahih al-Bukhari 1)",
            "📖 fiqh_hanafi.txt\nFive Pillars of Islam: Shahadah, Salah, Zakat, Sawm, Hajj.",
            "📖 seerah.txt\nThe Prophet Muhammad (peace be upon him) was born in Mecca in 570 CE. Hijra to Medina in 622 CE."
        ]
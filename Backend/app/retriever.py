import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

import math
from collections import defaultdict, Counter

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

def tokenize(text):
    """Fast tokenizer that strips stopwords but preserves numbers and theological terms"""
    return [w for w in re.findall(r'[a-z0-9]+', text.lower()) if (len(w) > 1 or w.isdigit()) and w not in STOP_WORDS]

class EnhancedRetriever:
    """High-accuracy, sub-10ms BM25 inverted-index retriever for authentic Islamic sources"""
    
    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()
        self.keyword_mappings = self._get_keyword_mappings()
        self.total_docs = len(self.knowledge_base)
        
        # Build inverted index & BM25 parameters
        self.inverted_index = defaultdict(list)
        self.doc_token_counts = []
        self.doc_lens = []
        self.quran_ref_map = defaultdict(list)
        self.bukhari_num_map = defaultdict(list)
        
        total_len = 0
        for doc_id, text in enumerate(self.knowledge_base):
            tokens = tokenize(text)
            counts = Counter(tokens)
            self.doc_token_counts.append(counts)
            doc_len = len(tokens)
            self.doc_lens.append(doc_len)
            total_len += doc_len
            
            for token in counts:
                self.inverted_index[token].append(doc_id)
                
            # Index Quran citations: e.g. Quran 2:255
            for ch, vs in re.findall(r'(?:quran\s+|surah\s+)?(\d+)[:\.](\d+)', text.lower()):
                self.quran_ref_map[f"{ch}:{vs}"].append(doc_id)
                
            # Index Bukhari numbers: e.g. (Bukhari 1)
            for b_num in re.findall(r'(?:bukhari|hadith)\s+(\d+)', text.lower()):
                self.bukhari_num_map[int(b_num)].append(doc_id)
                
        self.avg_doc_len = total_len / max(1, self.total_docs)
        
        # Precompute IDF for BM25
        self.idf = {}
        for token, postings in self.inverted_index.items():
            df = len(postings)
            self.idf[token] = math.log(1 + (self.total_docs - df + 0.5) / (df + 0.5))
            
        self.cache = {}
        print(f"✅ EnhancedRetriever initialized with {self.total_docs} knowledge entries (BM25 Index Built)")
    
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
            'prayer': ['prayer', 'salah', 'namaz', 'salat', 'rakat', 'rakah', 'worship', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'sujud', 'ruku', 'istikhara', 'witr', 'taraweeh', 'tahajjud'],
            'fasting': ['fasting', 'fast', 'ramadan', 'sawm', 'roza', 'iftar', 'suhoor', 'sehri', 'tarawih'],
            'zakat': ['zakat', 'charity', 'sadaqah', 'poor', 'wealth', 'money', 'donation', 'nisab', 'fitrah'],
            'hajj': ['hajj', 'pilgrimage', 'mecca', 'kaaba', 'umrah', 'tawaf', 'saee', 'arafat', 'muzdalifah', 'jamarat'],
            'wudu': ['wudu', 'ablution', 'purification', 'wash', 'clean', 'taharat', 'ghusl', 'tayammum', 'socks', 'leather'],
            'quran': ['quran', 'koran', 'surah', 'ayat', 'verse', 'revelation', 'recitation', 'memorization', 'kursi'],
            'hadith': ['hadith', 'prophet', 'muhammad', 'sunnah', 'narration', 'bukhari', 'muslim', 'tirmidhi', 'intention', 'intentions'],
            'islam': ['islam', 'muslim', 'faith', 'religion', 'belief', 'iman', 'tawheed', 'shahada'],
            'fiqh': ['fiqh', 'jurisprudence', 'halal', 'haram', 'fatwa', 'ruling', 'permissible', 'hanafi', 'shafi', 'maliki', 'hanbali'],
            'seerah': ['seerah', 'biography', 'prophet life', 'migration', 'hijra', 'medina', 'mecca', 'badr', 'uhud', 'khandaq']
        }
    
    def search_local_knowledge(self, question, max_results=5):
        """High-accuracy, sub-10ms BM25 search with exact verse/hadith citation and category boosts"""
        if not question or not question.strip():
            return self.knowledge_base[:max_results]

        normalized_query = question.strip()
        if normalized_query in self.cache:
            return self.cache[normalized_query]

        q_tokens = tokenize(normalized_query)
        if not q_tokens:
            return self.knowledge_base[:max_results]

        q_lower = normalized_query.lower()
        candidate_scores = defaultdict(float)
        k1 = 1.5
        b = 0.75

        # 1. BM25 term weighting across candidate documents
        for token in q_tokens:
            if token not in self.inverted_index:
                continue
            idf_val = self.idf[token]
            postings = self.inverted_index[token]
            for doc_id in postings:
                tf = self.doc_token_counts[doc_id][token]
                doc_len = self.doc_lens[doc_id]
                score = idf_val * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / self.avg_doc_len))))
                candidate_scores[doc_id] += score

        # 2. Boost exact Quran chapter:verse references (e.g. 2:255, 20:44)
        for ch, vs in re.findall(r'(\d+)[:\.](\d+)', q_lower):
            ref_key = f"{ch}:{vs}"
            pattern1 = f"quran {ch}:{vs}"
            pattern2 = f"{ch}:{vs} -"
            for doc_id in self.inverted_index.get(ch, []):
                doc_text = self.knowledge_base[doc_id].lower()
                if pattern1 in doc_text or pattern2 in doc_text or ref_key in doc_text:
                    candidate_scores[doc_id] += 300.0

        # 3. Boost exact Hadith numbers (e.g. Bukhari 1, Hadith 5020)
        for b_num in re.findall(r'(?:bukhari|hadith)\s+(\d+)', q_lower):
            pattern = f"(bukhari {b_num})"
            for doc_id in self.inverted_index.get(b_num, []):
                if pattern in self.knowledge_base[doc_id].lower():
                    candidate_scores[doc_id] += 300.0

        # 4. Multi-word phrase match boost
        if len(q_tokens) >= 2:
            query_phrase = " ".join(q_tokens)
            for doc_id in list(candidate_scores.keys()):
                if query_phrase in self.knowledge_base[doc_id].lower():
                    candidate_scores[doc_id] += 50.0

        # 5. Domain & Intent Boosting
        is_quran_intent = any(w in q_lower for w in ["quran", "surah", "ayah", "ayat", "verse", "recite", "tafsir", "kursi"])
        is_hadith_intent = any(w in q_lower for w in ["hadith", "bukhari", "prophet said", "messenger of allah", "narrated", "sunnah"])
        is_fiqh_intent = any(w in q_lower for w in ["ruling", "halal", "haram", "permissible", "fatwa", "fiqh", "wudu", "valid", "break", "socks"])

        for doc_id in list(candidate_scores.keys()):
            doc_header = self.knowledge_base[doc_id][:50].lower()
            if is_quran_intent and "quran.txt" in doc_header:
                candidate_scores[doc_id] += 25.0
            elif is_hadith_intent and "hadith_bukhari.txt" in doc_header:
                candidate_scores[doc_id] += 25.0
            elif is_fiqh_intent and ("fatwa_islamqa.md" in doc_header or "fiqh_hanafi.txt" in doc_header):
                candidate_scores[doc_id] += 35.0

        if not candidate_scores:
            return self.knowledge_base[:max_results]

        # Sort and take top matches
        ranked = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)
        results = [self.knowledge_base[doc_id] for doc_id, _ in ranked[:max_results]]

        # Store in LRU cache (up to 1,000 queries)
        if len(self.cache) < 1000:
            self.cache[normalized_query] = results

        return results
    
    def _get_default_islamic_knowledge(self):
        """Default Islamic knowledge base"""
        return [
            "📖 quran.txt\nQur'an 1:1-7 - Al-Fatihah (The Opening): In the name of Allah, the Entirely Merciful, the Especially Merciful.",
            "📖 quran.txt\nQur'an 2:255 - Ayat al-Kursi: Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
            "📖 hadith_bukhari.txt\nHadith: The Prophet Muhammad (peace be upon him) said: 'Actions are judged by intentions.' (Sahih al-Bukhari 1)",
            "📖 fiqh_hanafi.txt\nFive Pillars of Islam: Shahadah, Salah, Zakat, Sawm, Hajj.",
            "📖 seerah.txt\nThe Prophet Muhammad (peace be upon him) was born in Mecca in 570 CE. Hijra to Medina in 622 CE."
        ]
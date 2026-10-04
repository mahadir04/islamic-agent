import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
import os
import re

def compute_session_topic(messages: list) -> dict:
    """Compute the topic, subtopics explored, and progress percentage from session messages"""
    user_msgs = [m.get("content", "") for m in messages if m.get("role") == "user"]
    if not user_msgs:
        return {
            "name": "Spiritual Inquiries & Learning",
            "explored": 1,
            "total": 7,
            "percentage": 15
        }
    
    text_to_check = (user_msgs[-1] if len(user_msgs[-1]) > 3 else " ".join(user_msgs)).lower()
    
    if any(w in text_to_check for w in ["prayer", "salah", "namaz", "rakat", "fajr", "wudu", "taharah", "ghusl", "sujood"]):
        topic_name = "Prayer & Purification (Salah & Taharah)"
    elif any(w in text_to_check for w in ["fasting", "sawm", "ramadan", "iftar", "suhoor", "tarawih"]):
        topic_name = "Fasting & Ramadan (Sawm)"
    elif any(w in text_to_check for w in ["zakat", "charity", "sadaqah", "wealth", "gold", "nisab"]):
        topic_name = "Zakat & Ethical Wealth"
    elif any(w in text_to_check for w in ["hajj", "umrah", "makkah", "kaaba", "tawaf", "ihram"]):
        topic_name = "Hajj & Umrah Pilgrimage"
    elif any(w in text_to_check for w in ["anxiety", "patience", "sabr", "tawakkul", "stress", "hardship", "peace", "grief"]):
        topic_name = "Tawakkul (Reliance on Allah)"
    elif any(w in text_to_check for w in ["marriage", "family", "parents", "children", "nikah", "divorce", "spouse"]):
        topic_name = "Family & Social Ethics"
    elif any(w in text_to_check for w in ["quran", "surah", "ayah", "recitation", "tajweed", "tafsir"]):
        topic_name = "Quranic Sciences & Reflection"
    elif any(w in text_to_check for w in ["hadith", "sunnah", "prophet", "bukhari", "muslim", "seerah"]):
        topic_name = "Prophetic Sunnah & Seerah"
    elif any(w in text_to_check for w in ["halal", "haram", "ruling", "permissible", "fiqh"]):
        topic_name = "Islamic Jurisprudence (Fiqh)"
    else:
        topic_name = "Quranic Wisdom & Daily Reflection"
        
    explored = min(max(1, len(user_msgs)), 7)
    progress_pct = int((explored / 7) * 100)
    return {
        "name": topic_name,
        "explored": explored,
        "total": 7,
        "percentage": progress_pct
    }

def extract_session_sources(messages: list) -> list:
    """Extract sources, Quran tags, and Hadith tags from bot answers in messages"""
    sources = []
    for m in messages:
        if m.get("role") in ["bot", "assistant"]:
            content = m.get("content", "")
            q_matches = re.findall(r'\[QURAN\]([\s\S]*?)\[\/QURAN\](?:\s*\((.*?)\))?', content)
            for q_text, q_ref in q_matches:
                ref_name = q_ref.strip() if q_ref else "Divine Revelation"
                sources.append(f"Holy Quran · {ref_name}\n{q_text.strip()[:200]}")
            h_matches = re.findall(r'\[HADITH\]([\s\S]*?)\[\/HADITH\](?:\s*\((.*?)\))?', content)
            for h_text, h_ref in h_matches:
                ref_name = h_ref.strip() if h_ref else "Prophetic Narration"
                sources.append(f"Prophetic Hadith · {ref_name}\n{h_text.strip()[:200]}")
    return sources[:4]


class Session:
    def __init__(self, session_id=None, name=None, user_id=None, topic=None, sources=None, suggested_actions=None):
        self.id = session_id or str(uuid.uuid4())
        self.user_id = user_id or "unknown"
        self.name = name or "New Conversation"
        self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()
        self.messages = []
        self.message_count = 0
        self.preview = "No messages yet"
        self.topic = topic or None
        self.sources = sources or []
        self.suggested_actions = suggested_actions or []

    def add_message(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.message_count = len(self.messages)
        self.updated_at = datetime.now().isoformat()

        # On the very first user message, rename the session to that question
        if role == "user":
            user_messages = [m for m in self.messages if m["role"] == "user"]
            if len(user_messages) == 1:
                # Rename session to first question (max 40 chars)
                self.name = content[:40] + "..." if len(content) > 40 else content
            # Always update preview with latest user message
            self.preview = content[:50] + "..." if len(content) > 50 else content
            
        # Recompute dynamic topic whenever a message is added
        self.topic = compute_session_topic(self.messages)

    def get_display_name(self):
        if self.name and self.name not in ["New Conversation", "Spiritual guidance", "Spiritual Inquiry"]:
            return self.name
        for m in self.messages:
            if m.get("role") == "user" and m.get("content"):
                cleaned = m["content"].strip().replace("\n", " ")
                return cleaned[:45] + "..." if len(cleaned) > 45 else cleaned
        return self.name or "New Conversation"

    def to_dict(self):
        display_title = self.get_display_name()
        topic = self.topic or compute_session_topic(self.messages)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": display_title,
            "title": display_title,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "message_count": self.message_count,
            "preview": self.preview,
            "topic": topic
        }

    def to_full_dict(self):
        display_title = self.get_display_name()
        topic = self.topic or compute_session_topic(self.messages)
        sources = self.sources if self.sources else extract_session_sources(self.messages)
        suggested_actions = self.suggested_actions
        if not suggested_actions:
            topic_clean = topic["name"].split('(')[0].strip()
            suggested_actions = [
                {"title": f"Explore verses on {topic_clean}", "action": "quran"},
                {"title": "Save Dua to Favorites", "action": "favorite"}
            ]
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": display_title,
            "title": display_title,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "messages": self.messages,
            "message_count": self.message_count,
            "topic": topic,
            "sources": sources,
            "suggested_actions": suggested_actions
        }


class SessionManager:
    def __init__(self, storage_file="sessions.json"):
        self.storage_file = storage_file
        self.sessions: Dict[str, Session] = {}
        self.load_sessions()

    def load_sessions(self):
        """Load sessions from file"""
        try:
            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for session_id, session_data in data.items():
                        user_id = session_data.get("user_id", "unknown")
                        topic = session_data.get("topic")
                        sources = session_data.get("sources", [])
                        suggested_actions = session_data.get("suggested_actions", [])
                        session = Session(
                            session_id=session_id, 
                            user_id=user_id,
                            topic=topic,
                            sources=sources,
                            suggested_actions=suggested_actions
                        )
                        session.name = session_data.get("name", session.name)
                        session.created_at = session_data.get("created_at", session.created_at)
                        session.updated_at = session_data.get("updated_at", session.updated_at)
                        session.message_count = session_data.get("message_count", 0)
                        session.preview = session_data.get("preview", "")
                        session.messages = session_data.get("messages", [])
                        # Ensure topic is initialized if not present in saved file
                        if not session.topic and session.messages:
                            session.topic = compute_session_topic(session.messages)
                        self.sessions[session_id] = session
        except Exception as e:
            print(f"Error loading sessions: {e}")

    def save_sessions(self):
        """Save sessions to file"""
        try:
            data = {}
            for session_id, session in self.sessions.items():
                data[session_id] = {
                    "id": session.id,
                    "user_id": session.user_id,
                    "name": session.name,
                    "created_at": session.created_at,
                    "updated_at": session.updated_at,
                    "message_count": session.message_count,
                    "preview": session.preview,
                    "messages": session.messages,
                    "topic": session.topic or compute_session_topic(session.messages),
                    "sources": session.sources,
                    "suggested_actions": session.suggested_actions
                }
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving sessions: {e}")

    def create_session(self, user_id: str, name=None):
        """Create a new session for a specific user"""
        session = Session(name=name, user_id=user_id)
        self.sessions[session.id] = session
        self.save_sessions()
        return session.id

    def get_session(self, session_id: str, user_id: str = None):
        """Get a session by ID — optionally verify it belongs to user_id"""
        session = self.sessions.get(session_id)
        if session is None:
            return None
        # If user_id is provided, enforce ownership
        if user_id and session.user_id != user_id:
            return None
        return session

    def get_all_sessions(self, user_id: str):
        """Get all sessions belonging to a specific user, sorted by updated_at"""
        sessions = [s for s in self.sessions.values() if s.user_id == user_id]
        sessions.sort(key=lambda s: s.updated_at, reverse=True)
        return [s.to_dict() for s in sessions]

    def delete_session(self, session_id: str, user_id: str):
        """Delete a session — only if it belongs to user_id"""
        session = self.sessions.get(session_id)
        if not session or session.user_id != user_id:
            return False
        del self.sessions[session_id]
        self.save_sessions()
        return True

    def add_message(self, session_id: str, role: str, content: str, user_id: str = None):
        """Add a message to a session"""
        session = self.get_session(session_id, user_id=user_id)
        if session:
            session.add_message(role, content)
            self.save_sessions()
            return True
        return False

    def get_messages(self, session_id: str, user_id: str = None, limit: int = None):
        """Get messages from a session"""
        session = self.get_session(session_id, user_id=user_id)
        if session:
            messages = session.messages
            if limit:
                messages = messages[-limit:]
            return messages
        return []
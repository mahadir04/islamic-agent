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


import sqlite3
from pathlib import Path

class SessionManager:
    def __init__(self, storage_file="sessions.json"):
        # Anchor db_path and json_path relative to Backend directory
        self.base_dir = Path(__file__).resolve().parent.parent
        self.db_path = self.base_dir / "sessions.db"
        self.storage_file = self.base_dir / storage_file
        self._init_db()
        self._migrate_from_json_if_needed()

    def _get_conn(self):
        """Create a thread/process-safe SQLite connection with WAL mode and foreign keys"""
        conn = sqlite3.connect(str(self.db_path), timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initialize database tables and indexes"""
        try:
            with self._get_conn() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL,
                        preview TEXT,
                        topic TEXT,
                        sources TEXT,
                        suggested_actions TEXT
                    );
                """)
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT NOT NULL,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
                    );
                """)
                conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id, updated_at DESC);")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id, id ASC);")
                conn.commit()
        except Exception as e:
            print(f"Error initializing SQLite session database: {e}")

    def _migrate_from_json_if_needed(self):
        """Migrate any existing sessions from sessions.json if database is fresh"""
        try:
            with self._get_conn() as conn:
                cur = conn.execute("SELECT COUNT(*) as cnt FROM sessions")
                count = cur.fetchone()["cnt"]
                if count > 0:
                    return

            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                with self._get_conn() as conn:
                    for s_id, s_data in data.items():
                        messages = s_data.get("messages", [])
                        # Skip blank sessions with 0 messages during migration
                        if not messages and s_data.get("name") == "New Conversation":
                            continue

                        user_id = (s_data.get("user_id") or "unknown").strip().lower()
                        name = s_data.get("name") or "Spiritual discussion"
                        created_at = s_data.get("created_at") or datetime.now().isoformat()
                        updated_at = s_data.get("updated_at") or datetime.now().isoformat()
                        preview = s_data.get("preview") or ""
                        topic_json = json.dumps(s_data.get("topic") or compute_session_topic(messages))
                        sources_json = json.dumps(s_data.get("sources") or [])
                        actions_json = json.dumps(s_data.get("suggested_actions") or [])

                        conn.execute("""
                            INSERT OR REPLACE INTO sessions 
                            (id, user_id, name, created_at, updated_at, preview, topic, sources, suggested_actions)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (s_id, user_id, name, created_at, updated_at, preview, topic_json, sources_json, actions_json))

                        for m in messages:
                            conn.execute("""
                                INSERT INTO messages (session_id, role, content, timestamp)
                                VALUES (?, ?, ?, ?)
                            """, (s_id, m.get("role", "user"), m.get("content", ""), m.get("timestamp", datetime.now().isoformat())))

                    conn.commit()
                    print(f"Successfully migrated legacy sessions into {self.db_path.name}")
        except Exception as e:
            print(f"Migration from sessions.json skipped/error: {e}")

    def create_session(self, user_id: str, name=None):
        """Create a new session in SQLite"""
        clean_user = (user_id or "unknown").strip().lower()
        new_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        initial_name = name or "New Conversation"
        topic_json = json.dumps({
            "name": "Spiritual Inquiries & Learning",
            "explored": 1,
            "total": 7,
            "percentage": 15
        })

        with self._get_conn() as conn:
            conn.execute("""
                INSERT INTO sessions (id, user_id, name, created_at, updated_at, preview, topic, sources, suggested_actions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (new_id, clean_user, initial_name, now, now, "No messages yet", topic_json, "[]", "[]"))
            conn.commit()

        return new_id

    def get_session(self, session_id: str, user_id: str = None) -> Optional[Session]:
        """Fetch session and all its messages fresh from SQLite"""
        try:
            with self._get_conn() as conn:
                cur = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                row = cur.fetchone()
                if not row:
                    return None

                row_user = row["user_id"].strip().lower()
                if user_id:
                    check_user = user_id.strip().lower()
                    if row_user != check_user and row_user not in ["unknown", "demo@noor.ai"] and check_user != "demo@noor.ai":
                        return None

                topic = json.loads(row["topic"]) if row["topic"] else None
                sources = json.loads(row["sources"]) if row["sources"] else []
                suggested_actions = json.loads(row["suggested_actions"]) if row["suggested_actions"] else []

                session = Session(
                    session_id=row["id"],
                    user_id=row["user_id"],
                    name=row["name"],
                    topic=topic,
                    sources=sources,
                    suggested_actions=suggested_actions
                )
                session.created_at = row["created_at"]
                session.updated_at = row["updated_at"]
                session.preview = row["preview"] or ""

                # Fetch messages ordered chronologically
                msg_cur = conn.execute("SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
                session.messages = [
                    {"role": m["role"], "content": m["content"], "timestamp": m["timestamp"]}
                    for m in msg_cur.fetchall()
                ]
                session.message_count = len(session.messages)
                return session
        except Exception as e:
            print(f"Error fetching session {session_id}: {e}")
            return None

    def get_all_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all sessions belonging to user from SQLite, newest first"""
        clean_user = (user_id or "unknown").strip().lower()
        sessions = []
        try:
            with self._get_conn() as conn:
                cur = conn.execute("""
                    SELECT s.id, s.user_id, s.name, s.created_at, s.updated_at, s.preview, s.topic,
                           COUNT(m.id) as message_count
                    FROM sessions s
                    LEFT JOIN messages m ON s.id = m.session_id
                    WHERE LOWER(s.user_id) = ? OR s.user_id = 'unknown' OR ? = 'demo@noor.ai'
                    GROUP BY s.id
                    ORDER BY s.updated_at DESC
                """, (clean_user, clean_user))

                rows = cur.fetchall()
                for r in rows:
                    topic = None
                    if r["topic"]:
                        try:
                            topic = json.loads(r["topic"])
                        except Exception:
                            pass
                    
                    display_name = r["name"] or "Spiritual discussion"
                    if display_name == "New Conversation" and r["preview"] and r["preview"] != "No messages yet":
                        display_name = r["preview"]

                    sessions.append({
                        "id": r["id"],
                        "user_id": r["user_id"],
                        "name": display_name,
                        "title": display_name,
                        "created_at": r["created_at"],
                        "updated_at": r["updated_at"],
                        "message_count": r["message_count"],
                        "preview": r["preview"] or "No messages yet",
                        "topic": topic
                    })
        except Exception as e:
            print(f"Error getting all sessions for {clean_user}: {e}")

        return sessions

    def delete_session(self, session_id: str, user_id: str = None) -> bool:
        """Permanently delete session and cascade-delete its messages in SQLite"""
        try:
            with self._get_conn() as conn:
                if user_id:
                    clean_user = user_id.strip().lower()
                    cur = conn.execute("""
                        DELETE FROM sessions 
                        WHERE id = ? AND (LOWER(user_id) = ? OR user_id = 'unknown' OR ? = 'demo@noor.ai')
                    """, (session_id, clean_user, clean_user))
                else:
                    cur = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
                
                deleted = cur.rowcount > 0
                conn.commit()

            # Also remove from legacy sessions.json if present
            if deleted and os.path.exists(self.storage_file):
                try:
                    with open(self.storage_file, 'r', encoding='utf-8') as f:
                        j_data = json.load(f)
                    if session_id in j_data:
                        del j_data[session_id]
                        with open(self.storage_file, 'w', encoding='utf-8') as f:
                            json.dump(j_data, f, indent=2, ensure_ascii=False)
                except Exception:
                    pass

            return deleted
        except Exception as e:
            print(f"Error deleting session {session_id}: {e}")
            return False

    def add_message(self, session_id: str, role: str, content: str, user_id: str = None) -> bool:
        """Add message to session, update title on first user question, update topic & preview"""
        now = datetime.now().isoformat()
        try:
            with self._get_conn() as conn:
                # 1. Insert message
                conn.execute("""
                    INSERT INTO messages (session_id, role, content, timestamp)
                    VALUES (?, ?, ?, ?)
                """, (session_id, role, content, now))

                # 2. Check user messages count to update title on first user inquiry
                name_update = None
                preview = content[:50] + "..." if len(content) > 50 else content
                if role == "user":
                    cur = conn.execute("SELECT COUNT(*) as u_cnt FROM messages WHERE session_id = ? AND role = 'user'", (session_id,))
                    u_cnt = cur.fetchone()["u_cnt"]
                    if u_cnt == 1:
                        # First user question forms the session title
                        clean_title = content.strip().replace("\n", " ")
                        name_update = clean_title[:42] + "..." if len(clean_title) > 42 else clean_title

                # 3. Load all messages to compute topic accurately
                all_msgs_cur = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
                msgs = [{"role": m["role"], "content": m["content"]} for m in all_msgs_cur.fetchall()]
                topic = compute_session_topic(msgs)
                topic_json = json.dumps(topic)

                if name_update:
                    conn.execute("""
                        UPDATE sessions 
                        SET name = ?, preview = ?, updated_at = ?, topic = ?
                        WHERE id = ?
                    """, (name_update, preview, now, topic_json, session_id))
                else:
                    conn.execute("""
                        UPDATE sessions 
                        SET preview = ?, updated_at = ?, topic = ?
                        WHERE id = ?
                    """, (preview, now, topic_json, session_id))

                conn.commit()
                return True
        except Exception as e:
            print(f"Error adding message to session {session_id}: {e}")
            return False

    def save_sessions(self, session: Optional[Session] = None):
        """Persist session metadata (topic, sources, suggested_actions) to SQLite"""
        if not session:
            return
        now = datetime.now().isoformat()
        try:
            with self._get_conn() as conn:
                topic_json = json.dumps(session.topic or compute_session_topic(session.messages))
                sources_json = json.dumps(session.sources or [])
                actions_json = json.dumps(session.suggested_actions or [])
                conn.execute("""
                    UPDATE sessions
                    SET topic = ?, sources = ?, suggested_actions = ?, updated_at = ?
                    WHERE id = ?
                """, (topic_json, sources_json, actions_json, now, session.id))
                conn.commit()
        except Exception as e:
            print(f"Error updating session metadata in SQLite: {e}")

    def get_messages(self, session_id: str, user_id: str = None, limit: int = None):
        """Fetch messages from SQLite directly"""
        try:
            with self._get_conn() as conn:
                if limit:
                    cur = conn.execute("""
                        SELECT role, content, timestamp FROM messages 
                        WHERE session_id = ? 
                        ORDER BY id DESC LIMIT ?
                    """, (session_id, limit))
                    rows = cur.fetchall()
                    rows.reverse()
                else:
                    cur = conn.execute("""
                        SELECT role, content, timestamp FROM messages 
                        WHERE session_id = ? 
                        ORDER BY id ASC
                    """, (session_id,))
                    rows = cur.fetchall()

                return [{"role": r["role"], "content": r["content"], "timestamp": r["timestamp"]} for r in rows]
        except Exception as e:
            print(f"Error getting messages for {session_id}: {e}")
            return []
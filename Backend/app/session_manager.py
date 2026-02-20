import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional
import os

class Session:
    def __init__(self, session_id=None, name=None):
        self.id = session_id or str(uuid.uuid4())
        self.name = name or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()
        self.messages = []
        self.message_count = 0
        self.preview = "New conversation"
    
    def add_message(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.message_count = len(self.messages)
        self.updated_at = datetime.now().isoformat()
        
        # Update preview with first user message
        if role == "user" and len(self.messages) <= 2:
            self.preview = content[:50] + "..." if len(content) > 50 else content
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "message_count": self.message_count,
            "preview": self.preview
        }
    
    def to_full_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "messages": self.messages,
            "message_count": self.message_count
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
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    for session_id, session_data in data.items():
                        session = Session(session_id)
                        session.name = session_data.get("name", session.name)
                        session.created_at = session_data.get("created_at", session.created_at)
                        session.updated_at = session_data.get("updated_at", session.updated_at)
                        session.message_count = session_data.get("message_count", 0)
                        session.preview = session_data.get("preview", "")
                        session.messages = session_data.get("messages", [])
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
                    "name": session.name,
                    "created_at": session.created_at,
                    "updated_at": session.updated_at,
                    "message_count": session.message_count,
                    "preview": session.preview,
                    "messages": session.messages
                }
            with open(self.storage_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving sessions: {e}")
    
    def create_session(self, name=None):
        """Create a new session"""
        session = Session(name=name)
        self.sessions[session.id] = session
        self.save_sessions()
        return session.id
    
    def get_session(self, session_id: str):
        """Get a session by ID"""
        return self.sessions.get(session_id)
    
    def get_all_sessions(self):
        """Get all sessions sorted by updated_at"""
        sessions = list(self.sessions.values())
        sessions.sort(key=lambda s: s.updated_at, reverse=True)
        return [s.to_dict() for s in sessions]
    
    def delete_session(self, session_id: str):
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            self.save_sessions()
            return True
        return False
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add a message to a session"""
        session = self.get_session(session_id)
        if session:
            session.add_message(role, content)
            self.save_sessions()
            return True
        return False
    
    def get_messages(self, session_id: str, limit: int = None):
        """Get messages from a session"""
        session = self.get_session(session_id)
        if session:
            messages = session.messages
            if limit:
                messages = messages[-limit:]
            return messages
        return []
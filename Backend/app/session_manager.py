import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class SessionManager:
    """Manages conversation sessions with history"""
    
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
        logger.info("✅ SessionManager initialized")
    
    def create_session(self) -> str:
        """Create a new session and return session ID"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "id": session_id,
            "name": "New Chat",
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        logger.info(f"📝 Created new session: {session_id}")
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str) -> bool:
        """Add a message to session history"""
        if session_id not in self.sessions:
            logger.warning(f"⚠️ Session {session_id} not found, creating new one")
            self.create_session()
            self.sessions[session_id]["id"] = session_id
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        self.sessions[session_id]["messages"].append(message)
        self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
        
        # Auto-name session from first user message
        if role == "user" and self.sessions[session_id]["name"] == "New Chat":
            self.sessions[session_id]["name"] = content[:50] + ("..." if len(content) > 50 else "")
        
        logger.info(f"💬 Added {role} message to session {session_id}")
        return True
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """Get full session data"""
        return self.sessions.get(session_id)
    
    def get_messages(self, session_id: str, limit: int = 10) -> List[dict]:
        """Get recent messages from a session"""
        if session_id not in self.sessions:
            return []
        
        messages = self.sessions[session_id]["messages"]
        return messages[-limit:] if limit else messages
    
    def get_all_sessions(self) -> List[dict]:
        """Get all sessions (metadata only, not full messages)"""
        sessions_list = []
        for session_id, session_data in self.sessions.items():
            # Get preview from last message
            preview = ""
            if session_data["messages"]:
                last_msg = session_data["messages"][-1]
                preview = last_msg["content"][:100] + ("..." if len(last_msg["content"]) > 100 else "")
            
            sessions_list.append({
                "id": session_data["id"],
                "name": session_data["name"],
                "preview": preview,
                "created_at": session_data["created_at"],
                "updated_at": session_data["updated_at"],
                "message_count": len(session_data["messages"])
            })
        
        # Sort by updated_at (most recent first)
        sessions_list.sort(key=lambda x: x["updated_at"], reverse=True)
        return sessions_list
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"🗑️ Deleted session: {session_id}")
            return True
        return False
    
    def update_session_name(self, session_id: str, name: str) -> bool:
        """Update session name"""
        if session_id in self.sessions:
            self.sessions[session_id]["name"] = name
            self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
            return True
        return False
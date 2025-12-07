from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.agent import IslamicAgent
from app.session_manager import SessionManager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize agent and session manager
agent = IslamicAgent()
session_manager = SessionManager()

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    name: str
    preview: str
    created_at: str
    updated_at: str
    message_count: int

class MessageResponse(BaseModel):
    role: str
    content: str
    timestamp: str

@router.post("/ask")
async def ask_question(req: QuestionRequest):
    try:
        logger.info(f"Received question: {req.question}")
        
        # Create new session if none provided
        if not req.session_id:
            session_id = session_manager.create_session()
        else:
            session_id = req.session_id
        
        # Get conversation history
        conversation_history = session_manager.get_messages(session_id, limit=10)
        
        # Get answer from agent with context
        answer = await agent.answer_question(req.question, conversation_history)
        
        # Save to session history
        session_manager.add_message(session_id, "user", req.question)
        session_manager.add_message(session_id, "bot", answer)
        
        logger.info("Question answered successfully")
        
        return {
            "answer": answer,
            "session_id": session_id
        }
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/sessions")
async def get_sessions():
    """Get all sessions"""
    try:
        sessions = session_manager.get_all_sessions()
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session with full message history"""
    try:
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/sessions/new")
async def create_new_session():
    """Create a new session"""
    try:
        session_id = session_manager.create_session()
        return {
            "session_id": session_id,
            "message": "New session created"
        }
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    try:
        success = session_manager.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/")
def health_check():
    return {"status": "running"}

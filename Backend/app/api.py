from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from app.agent import IslamicAgent
from app.session_manager import SessionManager
from app.auth import create_access_token, get_current_user, user_db
from datetime import datetime, timedelta
import logging
import httpx
import os
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize agent and session manager
agent = IslamicAgent()
session_manager = SessionManager()

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

# Auth routes
@router.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/auth/google/callback"
    
    if not client_id:
        logger.error("GOOGLE_CLIENT_ID not found in environment variables")
        return {"error": "Google OAuth is not configured"}
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=email%20profile"
        f"&access_type=offline"
    )
    
    logger.info(f"Redirecting to Google: {google_auth_url}")
    return RedirectResponse(google_auth_url)

@router.get("/auth/google/callback")
async def google_callback(request: Request, code: str = None, error: str = None):
    """Handle Google OAuth callback"""
    if error:
        logger.error(f"Google returned error: {error}")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/login?error={error}")
    
    if not code:
        logger.error("No code received from Google")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/login?error=no_code")
    
    try:
        # Exchange code for token
        token_data = {
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/auth/google/callback",
            "grant_type": "authorization_code",
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data=token_data
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.status_code}")
                frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
                return RedirectResponse(url=f"{frontend_url}/login?error=token_exchange_failed")
            
            token_json = token_response.json()
            access_token = token_json.get("access_token")
            
            # Get user info
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                logger.error(f"Failed to get user info: {user_response.status_code}")
                frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
                return RedirectResponse(url=f"{frontend_url}/login?error=user_info_failed")
            
            user_info = user_response.json()
            email = user_info['email']
            name = user_info.get('name', email.split('@')[0])
            picture = user_info.get('picture', '')
            
            # Check if user exists
            user = user_db.get_user(email)
            
            if not user:
                # Create new user
                user = {
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "google_id": user_info.get('id', ''),
                    "created_at": datetime.now().isoformat(),
                    "last_login": datetime.now().isoformat(),
                    "preferences": {},
                    "settings": {
                        "theme": "light",
                        "language": "en",
                        "notifications": True,
                        "font_size": "medium"
                    }
                }
                user_db.create_user(email, user)
                logger.info(f"✅ New user created: {email}")
            else:
                # Update existing user
                user["name"] = name
                user["picture"] = picture
                user["last_login"] = datetime.now().isoformat()
                user_db.update_user(email, user)
                logger.info(f"✅ Existing user logged in: {email}")
            
            # Create JWT token
            access_token_expires = timedelta(minutes=30)
            jwt_token = create_access_token(
                data={"sub": email},
                expires_delta=access_token_expires
            )
            
            # Redirect to frontend with token
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            return RedirectResponse(
                url=f"{frontend_url}/auth/callback?token={jwt_token}"
            )
            
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}", exc_info=True)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(url=f"{frontend_url}/login?error=auth_failed")

@router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user

# Session routes
@router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for current user"""
    try:
        sessions = session_manager.get_all_sessions()
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        return {"sessions": []}

@router.post("/sessions/new")
async def create_session(current_user: dict = Depends(get_current_user)):
    """Create a new session"""
    try:
        session_id = session_manager.create_session()
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific session with full message history"""
    try:
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session.to_full_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
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

# Question route
@router.post("/ask")
async def ask_question(
    req: QuestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ask a question"""
    try:
        logger.info(f"Question from {current_user['email']}: {req.question[:50]}...")
        
        # Create new session if none provided
        if not req.session_id:
            session_id = session_manager.create_session()
        else:
            session_id = req.session_id
            if not session_manager.get_session(session_id):
                session_id = session_manager.create_session()
        
        # Get conversation history
        conversation_history = session_manager.get_messages(session_id, limit=10)
        
        # Get answer from agent with context
        answer = await agent.answer_question(req.question, conversation_history)
        
        # Save to session history
        session_manager.add_message(session_id, "user", req.question)
        session_manager.add_message(session_id, "bot", answer)
        
        return {
            "answer": answer,
            "session_id": session_id
        }
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Profile routes
@router.get("/profile/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    return current_user

@router.get("/profile/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get user stats"""
    sessions = session_manager.get_all_sessions()
    total_chats = len(sessions)
    total_messages = sum(s.get("message_count", 0) for s in sessions)
    
    return {
        "total_chats": total_chats,
        "total_messages": total_messages,
        "favorite_topics": ["Prayer", "Fasting", "Zakat", "Hajj", "Quran"],
        "joined_date": current_user.get("created_at", datetime.now().isoformat()),
        "last_active": current_user.get("last_login", datetime.now().isoformat())
    }

@router.put("/profile/me")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "name" in profile_data:
        user["name"] = profile_data["name"]
    if "preferences" in profile_data:
        user["preferences"] = profile_data["preferences"]
    
    user_db.update_user(email, user)
    return user

@router.get("/")
def health_check():
    return {"status": "running", "message": "Islamic AI Agent API"}
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.agent import IslamicAgent
from app.session_manager import SessionManager
from app.auth import (
    create_access_token,
    get_current_user,
    get_current_user_optional,
    user_db,
    hash_password,
    verify_password
)
from app.islamic_services import (
    get_surahs_list,
    get_surah_detail,
    get_verse_of_the_day,
    get_hadith_of_the_day,
    get_prayer_timings,
    get_duas_list,
    get_hadith_books,
    get_hadith_book_detail,
    get_single_hadith,
    search_hadith_collection
)
from datetime import datetime, timedelta
import logging
import httpx
import os

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize agent and session manager
agent = IslamicAgent()
session_manager = SessionManager()

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SunnahToggleRequest(BaseModel):
    item_id: str
    done: bool

# Auth routes
@router.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000').rstrip('/')
    redirect_uri = f"{backend_url}/api/auth/google/callback"
    
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
            "redirect_uri": f"{os.getenv('BACKEND_URL', 'http://localhost:8000').rstrip('/')}/api/auth/google/callback",
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

@router.post("/auth/register")
async def register_user(req: RegisterRequest):
    """Register user with email, password, and name"""
    email = req.email.lower().strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    existing = user_db.get_user(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    
    name = req.name.strip() if req.name else email.split("@")[0].capitalize()
    new_user = {
        "email": email,
        "name": name,
        "password_hash": hash_password(req.password),
        "picture": f"https://api.dicebear.com/7.x/initials/svg?seed={name}&backgroundColor=00b875",
        "created_at": datetime.now().isoformat(),
        "last_login": datetime.now().isoformat(),
        "preferences": {},
        "settings": {
            "theme": "dark",
            "location": "Islamabad, Pakistan",
            "calculation_method": "University of Islamic Sciences, Karachi",
            "asr_school": "Hanafi",
            "ai_adaptive": True,
            "transliteration": False
        }
    }
    user = user_db.create_user(email, new_user)
    token = create_access_token(data={"sub": email}, expires_delta=timedelta(days=7))
    # Return user without password hash
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": safe_user}

@router.post("/auth/login")
async def login_user(req: LoginRequest):
    """Authenticate user with email and password"""
    email = req.email.lower().strip()
    user = user_db.get_user(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    stored_hash = user.get("password_hash")
    if not stored_hash or not verify_password(stored_hash, req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user["last_login"] = datetime.now().isoformat()
    user_db.update_user(email, user)
    token = create_access_token(data={"sub": email}, expires_delta=timedelta(days=7))
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": safe_user}

# Daily Guidance & Prayer Times routes
@router.get("/daily-guidance")
async def get_daily_guidance(
    city: Optional[str] = None,
    country: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Fetch prayer times, next prayer countdown, verse and hadith of the day, and sunnah progress for current or specified location"""
    try:
        settings = current_user.get("settings", {}) if current_user else {}
        preferences = current_user.get("preferences", {}) if current_user else {}
        
        user_loc = city or settings.get("location")
        calc_method = settings.get("calculation_method", "Muslim World League")
        asr_school = settings.get("asr_school", "Hanafi")
        
        # Parse city and country if provided
        loc_city = user_loc
        loc_country = country or ""
        if user_loc and "," in user_loc:
            parts = user_loc.split(",")
            loc_city = parts[0].strip()
            loc_country = parts[1].strip()
        
        # 1. Prayer times (auto-detects current location if city is None or 'current')
        prayer_data = get_prayer_timings(
            city=loc_city,
            country=loc_country,
            lat=lat,
            lon=lon,
            method=calc_method,
            asr_school=asr_school
        )
        
        # 2. Verse and Hadith of the day
        verse = get_verse_of_the_day()
        hadith = get_hadith_of_the_day()
        
        # 3. Sunnah items
        sunnah_items = preferences.get("daily_sunnah", [
            {"id": "morning_adhkar", "label": "Morning Adhkar", "done": False},
            {"id": "fajr_sunnah", "label": "2 Rakat Fajr Sunnah", "done": False},
            {"id": "read_quran", "label": "Read Quran / 1 Juz", "done": False},
            {"id": "evening_dhikr", "label": "Evening Dhikr", "done": False},
            {"id": "duha_prayer", "label": "Duha Prayer", "done": False},
            {"id": "surah_mulk", "label": "Surah Al-Mulk before sleep", "done": False},
            {"id": "tahajjud", "label": "Tahajjud Prayer", "done": False},
            {"id": "salawat", "label": "100 Salawat on Prophet ﷺ", "done": False}
        ])
        
        total_sunnah = len(sunnah_items)
        done_sunnah = sum(1 for item in sunnah_items if item.get("done", False))
        sunnah_percentage = int((done_sunnah / total_sunnah) * 100) if total_sunnah > 0 else 0
        
        return {
            "prayers": prayer_data,
            "verse_of_the_day": verse,
            "hadith_of_the_day": hadith,
            "daily_sunnah": {
                "items": sunnah_items,
                "total": total_sunnah,
                "done": done_sunnah,
                "percentage": sunnah_percentage
            }
        }
    except Exception as e:
        logger.error(f"Error in daily guidance: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not load daily guidance")

@router.get("/user/sunnah")
async def get_user_sunnah(current_user: dict = Depends(get_current_user)):
    """Get user's daily sunnah checklist"""
    preferences = current_user.get("preferences", {})
    sunnah_items = preferences.get("daily_sunnah", [])
    return {"sunnah": sunnah_items}

@router.post("/user/sunnah")
async def toggle_user_sunnah(req: SunnahToggleRequest, current_user: dict = Depends(get_current_user)):
    """Toggle a daily sunnah item and persist to user profile"""
    email = current_user["email"]
    user = user_db.get_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    preferences = user.setdefault("preferences", {})
    daily_sunnah = preferences.setdefault("daily_sunnah", [
        {"id": "morning_adhkar", "label": "Morning Adhkar", "done": True},
        {"id": "fajr_sunnah", "label": "2 Rakat Fajr Sunnah", "done": True},
        {"id": "read_quran", "label": "Read 1 Juz", "done": False},
        {"id": "evening_dhikr", "label": "Evening Dhikr", "done": False},
        {"id": "duha_prayer", "label": "Duha Prayer", "done": True},
        {"id": "surah_mulk", "label": "Surah Al-Mulk before sleep", "done": False},
        {"id": "tahajjud", "label": "Tahajjud Prayer", "done": False},
        {"id": "salawat", "label": "100 Salawat on Prophet ﷺ", "done": True}
    ])
    
    found = False
    for item in daily_sunnah:
        if item.get("id") == req.item_id:
            item["done"] = req.done
            found = True
            break
            
    if not found:
        daily_sunnah.append({"id": req.item_id, "label": req.item_id.replace("_", " ").title(), "done": req.done})
        
    user_db.update_user(email, user)
    
    total = len(daily_sunnah)
    done = sum(1 for it in daily_sunnah if it.get("done", False))
    return {"success": True, "sunnah": daily_sunnah, "done": done, "total": total}

# Quran Explorer routes
@router.get("/quran/surahs")
async def list_surahs():
    """Get all 114 Surahs with metadata"""
    surahs = get_surahs_list()
    return {"surahs": surahs}

@router.get("/quran/surah/{surah_id}")
async def get_surah(surah_id: int):
    """Get specific Surah with verses, Arabic text, translation, and audio"""
    if surah_id < 1 or surah_id > 114:
        raise HTTPException(status_code=404, detail="Surah not found (must be 1-114)")
    try:
        surah = get_surah_detail(surah_id)
        return surah
    except Exception as e:
        logger.error(f"Error fetching surah {surah_id}: {e}")
        raise HTTPException(status_code=500, detail="Could not load Surah")

@router.get("/quran/tafsir/{surah_id}/{ayah_num}")
async def get_ayah_tafsir(surah_id: int, ayah_num: int):
    """Get authentic scholarly Tafsir and spiritual reflection for an ayah"""
    try:
        surah = get_surah_detail(surah_id)
        verse_obj = next((v for v in surah.get("verses", []) if v.get("number") == ayah_num), None)
        verse_text = verse_obj.get("text_en", "") if verse_obj else ""
        tafsir = await agent.get_verse_tafsir(surah_id, ayah_num, verse_text)
        return {
            "surah_id": surah_id,
            "ayah_num": ayah_num,
            "tafsir": tafsir
        }
    except Exception as e:
        logger.error(f"Error getting tafsir for {surah_id}:{ayah_num}: {e}")
        return {
            "surah_id": surah_id,
            "ayah_num": ayah_num,
            "tafsir": "This verse reveals profound divine guidance, urging believers to reflect on Allah's mercy and live with moral mindfulness."
        }

# Daily Duas & Adhkar routes
@router.get("/duas")
async def list_duas(category: Optional[str] = None, search: Optional[str] = None):
    """Get authentic prophetic Duas & Adhkar categorized with Arabic, transliteration, and translation"""
    duas = get_duas_list(category=category, search=search)
    return {"duas": duas, "total": len(duas)}

# Hadith Explorer routes (Sahih al-Bukhari & Collections)
@router.get("/hadith/books")
async def list_hadith_books():
    """Get all 97 Books of Sahih al-Bukhari with metadata and hadith counts"""
    books = get_hadith_books()
    return {"books": books, "collection": "Sahih al-Bukhari", "total_books": len(books)}

@router.get("/hadith/book/{book_num}")
async def get_hadith_book(book_num: int, page: int = 1, limit: int = 25):
    """Get hadiths in a specific book with pagination and metadata"""
    if book_num < 1 or book_num > 97:
        raise HTTPException(status_code=404, detail="Book not found (must be 1-97 for Sahih al-Bukhari)")
    detail = get_hadith_book_detail(book_num, page=page, limit=limit)
    if not detail:
        raise HTTPException(status_code=404, detail="Book data not found")
    return detail

@router.get("/hadith/search")
async def search_hadiths(q: str, limit: int = 30):
    """Search hadiths across all 97 books by keyword, narrator, or hadith number"""
    results = search_hadith_collection(q, limit=limit)
    return {"query": q, "results": results, "total": len(results)}

@router.get("/hadith/{hadith_num}")
async def get_hadith_single(hadith_num: int):
    """Get a single hadith by its Bukhari number"""
    hadith = get_single_hadith(hadith_num)
    if not hadith:
        raise HTTPException(status_code=404, detail=f"Hadith #{hadith_num} not found")
    return hadith


# Session routes
@router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for current user"""
    try:
        user_id = current_user["email"]
        sessions = session_manager.get_all_sessions(user_id=user_id)
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        return {"sessions": []}

@router.post("/sessions/new")
async def create_session(current_user: dict = Depends(get_current_user)):
    """Create a new session"""
    try:
        user_id = current_user["email"]
        session_id = session_manager.create_session(user_id=user_id)
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific session with full message history"""
    try:
        user_id = current_user["email"]
        session = session_manager.get_session(session_id, user_id=user_id)
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
        user_id = current_user["email"]
        success = session_manager.delete_session(session_id, user_id=user_id)
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
    """Ask a question, returning both the structured answer and RAG sources"""
    try:
        user_id = current_user["email"]
        logger.info(f"Question from {user_id}: {req.question[:50]}...")
        
        # Create new session if none provided
        if not req.session_id:
            session_id = session_manager.create_session(user_id=user_id)
        else:
            session_id = req.session_id
            if not session_manager.get_session(session_id, user_id=user_id):
                session_id = session_manager.create_session(user_id=user_id)
        
        # Get conversation history
        conversation_history = session_manager.get_messages(session_id, user_id=user_id, limit=20)
        
        # Get answer and retrieved RAG sources from agent
        result = await agent.answer_question_with_sources(req.question, conversation_history)
        answer = result.get("answer", "")
        sources = result.get("sources", [])
        
        # Determine dynamic topic and progress
        q_lower = req.question.lower()
        if any(w in q_lower for w in ["prayer", "salah", "namaz", "rakat", "fajr", "wudu"]):
            topic_name = "Prayer & Purification (Salah & Taharah)"
        elif any(w in q_lower for w in ["fasting", "sawm", "ramadan", "iftar", "suhoor"]):
            topic_name = "Fasting & Ramadan (Sawm)"
        elif any(w in q_lower for w in ["zakat", "charity", "sadaqah", "wealth", "gold"]):
            topic_name = "Zakat & Ethical Wealth"
        elif any(w in q_lower for w in ["hajj", "umrah", "makkah", "kaaba"]):
            topic_name = "Hajj & Umrah Pilgrimage"
        elif any(w in q_lower for w in ["anxiety", "patience", "sabr", "tawakkul", "stress", "hardship", "peace"]):
            topic_name = "Tawakkul (Reliance on Allah)"
        elif any(w in q_lower for w in ["marriage", "family", "parents", "children"]):
            topic_name = "Family & Social Ethics"
        else:
            topic_name = "Quranic Wisdom & Daily Reflection"

        msg_count = len(conversation_history) + 1
        subtopics_explored = min(max(1, (msg_count // 2) + 1), 7)
        progress_pct = int((subtopics_explored / 7) * 100)

        suggested_actions = [
            {"title": f"Explore verses on {topic_name.split('(')[0].strip()}", "action": "quran"},
            {"title": "Save Dua to Favorites", "action": "favorite"}
        ]
        
        # Save to session history
        session_manager.add_message(session_id, "user", req.question, user_id=user_id)
        session_manager.add_message(session_id, "bot", answer, user_id=user_id)
        
        return {
            "answer": answer,
            "session_id": session_id,
            "sources": sources,
            "topic": {
                "name": topic_name,
                "explored": subtopics_explored,
                "total": 7,
                "percentage": progress_pct
            },
            "suggested_actions": suggested_actions
        }
    
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Profile routes
@router.get("/profile/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    safe_user = {k: v for k, v in current_user.items() if k != "password_hash"}
    return safe_user

@router.get("/profile/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    """Get user stats"""
    user_id = current_user["email"]
    sessions = session_manager.get_all_sessions(user_id=user_id)
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
    """Update user profile and spiritual preferences"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "name" in profile_data:
        user["name"] = profile_data["name"]
    if "picture" in profile_data:
        user["picture"] = profile_data["picture"]
    if "preferences" in profile_data:
        user.setdefault("preferences", {}).update(profile_data["preferences"])
    if "settings" in profile_data:
        user.setdefault("settings", {}).update(profile_data["settings"])
    
    user_db.update_user(email, user)
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return safe_user

# End of router routes
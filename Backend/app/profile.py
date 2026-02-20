from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.auth import get_current_user, user_db
from app.model import ProfileUpdate, UserResponse, UserStats
from datetime import datetime
import shutil
import os
from typing import Optional
import json

router = APIRouter(prefix="/profile", tags=["profile"])

PROFILE_PICS_DIR = "profile_pics"
os.makedirs(PROFILE_PICS_DIR, exist_ok=True)

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        email=current_user["email"],
        name=current_user["name"],
        picture=current_user.get("picture"),
        created_at=current_user.get("created_at", datetime.now().isoformat()),
        last_login=current_user.get("last_login", datetime.now().isoformat()),
        preferences=current_user.get("preferences", {}),
        settings=current_user.get("settings", {})
    )

@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile_update.name:
        user["name"] = profile_update.name
    if profile_update.picture:
        user["picture"] = profile_update.picture
    if profile_update.preferences:
        user["preferences"] = {**user.get("preferences", {}), **profile_update.preferences}
    if profile_update.settings:
        user["settings"] = {**user.get("settings", {}), **profile_update.settings}
    
    user_db.update_user(email, user)
    
    return UserResponse(
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        created_at=user.get("created_at", datetime.now().isoformat()),
        last_login=user.get("last_login", datetime.now().isoformat()),
        preferences=user.get("preferences", {}),
        settings=user.get("settings", {})
    )

@router.post("/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile picture"""
    email = current_user["email"]
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"{email.replace('@', '_at_')}.{file_extension}"
    file_path = os.path.join(PROFILE_PICS_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile with picture URL
    user = user_db.get_user(email)
    if user:
        picture_url = f"/profile/picture/{filename}"
        user["picture"] = picture_url
        user_db.update_user(email, user)
    
    return {"picture_url": picture_url}

@router.get("/stats", response_model=UserStats)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    # Load sessions for this user
    sessions_file = f"sessions_{email.replace('@', '_at_')}.json"
    try:
        with open(sessions_file, 'r') as f:
            sessions = json.load(f)
    except:
        sessions = {}
    
    # Calculate stats
    total_chats = len(sessions)
    total_messages = sum(s.get("message_count", 0) for s in sessions.values())
    
    # Analyze topics (simplified)
    topics = ["Prayer", "Fasting", "Zakat", "Hajj", "Quran", "Hadith"]
    
    return UserStats(
        total_chats=total_chats,
        total_messages=total_messages,
        favorite_topics=topics[:3],
        joined_date=user.get("created_at", datetime.now().isoformat()),
        last_active=user.get("last_login", datetime.now().isoformat())
    )

@router.delete("/me")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account"""
    email = current_user["email"]
    
    # Remove user from database
    if email in user_db.users:
        del user_db.users[email]
        user_db.save_users()
    
    # Delete user sessions file
    sessions_file = f"sessions_{email.replace('@', '_at_')}.json"
    if os.path.exists(sessions_file):
        os.remove(sessions_file)
    
    return {"message": "Account deleted successfully"}

@router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get user settings"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    default_settings = {
        "theme": "light",
        "language": "en",
        "notifications": True,
        "font_size": "medium",
        "auto_save": True
    }
    
    settings = user.get("settings", default_settings)
    return settings

@router.put("/settings")
async def update_settings(
    settings: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user settings"""
    email = current_user["email"]
    user = user_db.get_user(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["settings"] = {**user.get("settings", {}), **settings}
    user_db.update_user(email, user)
    
    return user["settings"]
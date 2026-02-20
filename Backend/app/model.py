from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    google_id: str

class UserResponse(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    created_at: str
    last_login: str
    preferences: Dict = {}
    settings: Dict = {}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    preferences: Optional[Dict] = None
    settings: Optional[Dict] = None

class UserStats(BaseModel):
    total_chats: int
    total_messages: int
    favorite_topics: List[str]
    joined_date: str
    last_active: str
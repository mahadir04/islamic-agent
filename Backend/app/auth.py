import os
from datetime import datetime, timedelta
from typing import Optional, Dict
import secrets
import json
import hashlib
import base64
import hmac
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
import httpx
import logging

logger = logging.getLogger(__name__)

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth settings
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

# Simple JWT implementation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a simple JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire.timestamp()})
    
    # Simple JWT encoding
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(
        hmac.new(
            SECRET_KEY.encode(),
            f"{header}.{payload}".encode(),
            hashlib.sha256
        ).digest()
    ).decode().rstrip("=")
    
    return f"{header}.{payload}.{signature}"

def decode_token(token: str):
    """Decode a JWT token"""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        header, payload, signature = parts
        
        # Verify signature
        expected_signature = base64.urlsafe_b64encode(
            hmac.new(
                SECRET_KEY.encode(),
                f"{header}.{payload}".encode(),
                hashlib.sha256
            ).digest()
        ).decode().rstrip("=")
        
        if signature != expected_signature:
            return None
        
        # Decode payload
        payload_bytes = base64.urlsafe_b64decode(payload + "==")
        payload_data = json.loads(payload_bytes)
        
        # Check expiration
        if payload_data.get("exp", 0) < datetime.utcnow().timestamp():
            return None
        
        return payload_data
    except Exception as e:
        logger.error(f"Token decode error: {e}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from token"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    from app.auth import user_db
    user = user_db.get_user(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_user_optional(token: str = Depends(oauth2_scheme)) -> Optional[dict]:
    """Get current user from token if available, without throwing 401"""
    if not token:
        return None
    try:
        payload = decode_token(token)
        if not payload:
            return None
        email = payload.get("sub")
        if not email:
            return None
        return user_db.get_user(email)
    except Exception:
        return None

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with SHA-256 and unique salt"""
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}:{hashed}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verify password against stored salt and hash"""
    try:
        if not stored_password or ":" not in stored_password:
            return False
        salt, hashed = stored_password.split(":", 1)
        calc = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(hashed, calc)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

# User database
class UserDB:
    def __init__(self):
        self.users_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users.json")
        self.load_users()
    
    def load_users(self):
        try:
            if os.path.exists(self.users_file):
                with open(self.users_file, 'r', encoding='utf-8') as f:
                    self.users = json.load(f)
            else:
                self.users = {}
        except Exception as e:
            logger.error(f"Error loading users: {e}")
            self.users = {}
    
    def save_users(self):
        try:
            with open(self.users_file, 'w', encoding='utf-8') as f:
                json.dump(self.users, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving users: {e}")
    
    def get_user(self, email: str):
        return self.users.get(email.lower().strip())
    
    def create_user(self, email: str, user_data: dict):
        clean_email = email.lower().strip()
        # Ensure default preferences and spiritual settings exist
        if "preferences" not in user_data:
            user_data["preferences"] = {}
        if "daily_sunnah" not in user_data["preferences"]:
            user_data["preferences"]["daily_sunnah"] = [
                {"id": "morning_adhkar", "label": "Morning Adhkar", "done": True},
                {"id": "fajr_sunnah", "label": "2 Rakat Fajr Sunnah", "done": True},
                {"id": "read_quran", "label": "Read 1 Juz", "done": False},
                {"id": "evening_dhikr", "label": "Evening Dhikr", "done": False},
                {"id": "duha_prayer", "label": "Duha Prayer", "done": True},
                {"id": "surah_mulk", "label": "Surah Al-Mulk before sleep", "done": False},
                {"id": "tahajjud", "label": "Tahajjud Prayer", "done": False},
                {"id": "salawat", "label": "100 Salawat on Prophet ﷺ", "done": True}
            ]
        if "settings" not in user_data:
            user_data["settings"] = {
                "theme": "dark",
                "location": "Islamabad, Pakistan",
                "calculation_method": "University of Islamic Sciences, Karachi",
                "asr_school": "Hanafi",
                "ai_adaptive": True,
                "transliteration": False
            }
        
        self.users[clean_email] = user_data
        self.save_users()
        return user_data
    
    def update_user(self, email: str, user_data: dict):
        clean_email = email.lower().strip()
        if clean_email in self.users:
            self.users[clean_email].update(user_data)
            self.save_users()
            return self.users[clean_email]
        return None

user_db = UserDB()
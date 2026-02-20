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

# User database
class UserDB:
    def __init__(self):
        self.users_file = "users.json"
        self.load_users()
    
    def load_users(self):
        try:
            with open(self.users_file, 'r') as f:
                self.users = json.load(f)
        except:
            self.users = {}
    
    def save_users(self):
        with open(self.users_file, 'w') as f:
            json.dump(self.users, f, indent=2)
    
    def get_user(self, email: str):
        return self.users.get(email)
    
    def create_user(self, email: str, user_data: dict):
        self.users[email] = user_data
        self.save_users()
        return user_data
    
    def update_user(self, email: str, user_data: dict):
        if email in self.users:
            self.users[email].update(user_data)
            self.save_users()
            return self.users[email]
        return None

user_db = UserDB()
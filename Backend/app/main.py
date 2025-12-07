from dotenv import load_dotenv
import os

# Load .env file FIRST
load_dotenv()

# Verify it's loaded
print(f"✅ GEMINI_API_KEY loaded: {os.getenv('GEMINI_API_KEY')[:20]}..." if os.getenv('GEMINI_API_KEY') else "❌ Not loaded")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Islamic AI Chat Agent",
    description="Backend for Islamic Q&A with local knowledge and Ollama fallback",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "running", "message": "Islamic AI Agent is ready"}

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting Islamic AI Backend Server...")
    port = int(os.getenv("PORT", 8000))  # ✅ Use PORT from environment
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, log_level="info")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Islamic AI Chat Agent",
    description="Backend for Islamic Q&A with local knowledge and Gemini fallback",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router)

@app.get("/")
def root():
    return {"status": "running", "message": "Islamic AI Agent is ready"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Islamic AI Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
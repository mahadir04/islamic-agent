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
    logger.info("Starting Islamic AI Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agent import IslamicAgent
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
agent = IslamicAgent()

class QuestionRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_question(req: QuestionRequest):
    try:
        logger.info(f"Received question: {req.question}")
        answer = await agent.answer_question(req.question)
        logger.info("Question answered successfully")
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/")
def health_check():
    return {"status": "running"}
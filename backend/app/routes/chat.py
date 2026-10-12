from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ollama import generate_response


router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/api/chat")
def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        response = generate_response(request.message)

        return {
            "response": response
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        )
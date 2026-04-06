from pydantic import BaseModel

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    conversation_id: str
    prompt: str
    message_history: list[Message] = []
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.chat_request import ChatRequest
from agent import agent, to_model_message
from db.database import init_db
from services.grocery import get_all_lists, get_all_groceries

init_db()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://foundry-sand.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

## TODO: CREATE get all lists / get all groceries
@app.get("/groceries/")
async def get_groceries():
    return get_all_groceries()

@app.get("/lists/")
async def get_ists():
    return get_all_lists()

@app.post("/chat/")
async def chat(prompt: ChatRequest):
    history = [to_model_message(m) for m in prompt.message_history]
    res = await agent.run(prompt.prompt, message_history=history)
    return {"answer": res.output, "history": res.all_messages_json()}

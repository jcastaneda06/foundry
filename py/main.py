from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.chat_request import ChatRequest
from agent import conversation_agent, to_model_message
from db.database import init_db
from services.grocery import get_all_lists, get_all_groceries, get_grocery_by_id, get_grocery_list_by_id, get_groceries_by_list_id, delete_list_by_id

init_db()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://foundry-sand.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/groceries/")
async def get_groceries():
    return get_all_groceries()

@app.get("/groceries/{id}")
async def get_g_by_id(id: str):
    return get_grocery_by_id(id)

@app.get("/groceries/{list_id}/lists")
async def get_g_by_l_id(list_id: int):
    return get_groceries_by_list_id(list_id)

@app.get("/lists/")
async def get_lists():
    return get_all_lists()

@app.get("/lists/{id}/")
async def get_l_by_id(id: str):
    return get_grocery_list_by_id(id)

@app.delete("/lists/{id}/")
async def delete_l_by_id(id):
    return delete_list_by_id(id)

@app.post("/chat/")
async def chat(prompt: ChatRequest):
    history = [to_model_message(m) for m in prompt.message_history]
    res = await conversation_agent.run(prompt.prompt, message_history=history, deps=prompt.conversation_id)
    return {"answer": res.output, "history": res.all_messages_json()}

from pydantic import BaseModel

class Grocery(BaseModel):
  id: int
  name: str
  description: str
  amount: int
  price: float
  list_id: int

class GroceryList(BaseModel):
  id: int
  name: str
  description: str
  completed: bool
  conversation_id: str | None = None
  
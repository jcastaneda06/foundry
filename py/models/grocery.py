from pydantic import BaseModel

class Grocery(BaseModel):
  name: str
  description: str
  amount: int
  price: float

  
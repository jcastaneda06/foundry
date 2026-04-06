from db.db import get_connection
from models.grocery import GroceryList

def get_all():
  with get_connection() as conn:
    cursor = conn.execute("SELECT * FROM lists")
    lists: list[GroceryList] = [
      GroceryList(id=l[0], name=l[1], description=l[2], completed=l[3])
      
      for l in cursor.fetchall()
    ]
    return lists
  
def get_by_id(id: str):
  with get_connection() as conn:
    cursor = conn.execute(f"""
      SELECT * FROM groceires
      WHERE id = {id}
    """)
    return cursor.fetchall()
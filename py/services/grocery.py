from db.database import get_connection
from models.grocery import GroceryList, Grocery

def get_all_groceries():
  with get_connection() as conn:
    cursor = conn.execute("SELECT * FROM groceries")
    groceries: list[Grocery] = [
      Grocery(id=g[0], name=g[1], description=g[2], amount=g[3], price=g[4], list_id=g[5])
      for g in cursor.fetchall()
    ]

    return groceries

def get_all_lists():
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
      SELECT * FROM groceries
      WHERE id = ?
    """, id)
    return cursor.fetchall()
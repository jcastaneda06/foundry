import sqlite3

db_name = "groceries.db"

def get_connection():
  return sqlite3.connect(db_name)

def init_db():
  with get_connection() as conn:
    conn.execute("""
      CREATE TABLE IF NOT EXISTS groceries (
          id INTEGER PRIMARY KEY,
          name VARCHAR,
          description VARCHAR,
          amount INTEGER,
          price NUMERIC,
          list_id INTEGER,
          FOREIGN KEY (list_id) REFERENCES lists(id)
      )
    """)

    conn.execute("""
      CREATE TABLE IF NOT EXISTS lists (
        id INTEGER PRIMARY KEY,
        name VARCHAR,
        description VARCHAR,
        completed NUMBER, -- 0 for false, 1 for true
        conversation_id INTEGER
      )
    """)

def execute_query(query: str, params: tuple):
  with get_connection() as conn:
    cursor = conn.execute(query, params)
    q = query.strip().upper()
    
    return cursor.fetchall() if q.startswith("SELECT") else cursor.lastrowid
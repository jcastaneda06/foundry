import sqlite3

db_name = "groceries.db"

def get_connection(): 
  print(f"Connection to {db_name} established")
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
        completed NUMBER -- 0 for false, 1 for true
      )
    """)

    print("Successfully created tables")

def execute_query(query: str, params: tuple) -> list[tuple]:
  with get_connection() as conn:
    cursor = conn.execute(query, params)
    print(f"Attempting to execute query for {params}")
    return cursor.fetchall()
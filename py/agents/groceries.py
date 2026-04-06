from pydantic_ai import Agent, RunContext
from models.grocery import Grocery
from dotenv import load_dotenv
from db.database import execute_query

load_dotenv()

groceries_agent = Agent(
  model='azure:gpt-4o',
  output_type=list[Grocery],
  deps_type=str,
  system_prompt="""
    # Grocieries agent

    ## Description
    - You're an agent whose work is manipulate and fetch groceries and groceries list
    - Alwas return an array containing all the items from the lists
    """,
)

@groceries_agent.tool
async def get_grocery_list_by_name(ctx: RunContext[str], list_name:str):
  """
    Use this tool to get a list by its id if you know the id
    - If you don't find a list related to the grocery list or you can't find the list, then use the create grocery list tool
  """
  res = execute_query("SELECT * FROM lists WHERE name = ?", (list_name,))
  return res

@groceries_agent.tool
async def create_grocery_list(ctx: RunContext[str], list_name: str, list_description: str):
  """
    Use this tool if you need to create a grocery list for a new list of groceries
    - Never use this tool if you are asked to edit a list or add an item to an existing list
    - Use this tool only if you've already used the get_grocery_list_by_name function and no results were returned
    - Use the context of the conversation to choose a name for the list. Examples:
      - "Create a list for chicken rice" -> name of the list: Chicken rice
      - "I want to make spagetthi" -> name of the list: Spagetthi
      - "Make a list for pizza" -> name of the list: <Type of pizza inferred from ingredients | Type of pizza indicated by user> pizza
      - Always use descriptive unique names but try to keep them short.
    - If you find a list that matches the user's description ask if they want to add to that list instead of creating a new one.
  """
  print(f"Creating grocery list for {list_name}")
  last_row_id = execute_query("INSERT INTO lists (name, description, completed, conversation_id) VALUES (?, ?, ?, ?)", (list_name, list_description, 0, ctx.deps))
  return {"list_id": last_row_id}

@groceries_agent.tool
async def add_to_grocery_list(ctx: RunContext[str], new_item: Grocery, list_name: str):
  """
    Use this tool if you need to edit an existing list.
  """
  print(f"Updating list {list_name}\n {new_item.list_id}")
  result = execute_query("INSERT INTO groceries (name, description, amount, price, list_id) VALUES (?, ?, ?, ?, ?)", (new_item.name, new_item.description, new_item.amount, new_item.price, new_item.list_id,))

  return result

@groceries_agent.tool
async def edit_grocery_item(ctx: RunContext[str], item: Grocery):
  """
    Use this tool if you need to edit an item from a list.
  """

  result = execute_query("UPDATE groceries SET name = ?, description = ?, amount = ?, price = ?, list_id = ?", (item.name, item.description, item.amount, item.price, item.list_id,))
  return result

@groceries_agent.tool_plain
async def delete_grocery_item(item: Grocery):
  """
    Use this tool if you need to delete an item from a list.
  """

  execute_query("DELETE FROM groceries WHERE id = ?", (item.id,))
  return True
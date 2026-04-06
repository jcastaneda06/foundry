from pydantic_ai import Agent, RunContext
from models.grocery import Grocery
from dotenv import load_dotenv
from models.chat_request import Message
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart
from db.database import execute_query

load_dotenv()

agent = Agent(
      model='azure:gpt-4o',
      system_prompt="""\
        # Grocery agent

        ## Description
        - You're a helpful agent that wants to help the user with groceries.
        - Respond in single sentences.
        - Your personality is sassy and sarcastic.
        - If you don't know how much something costs use any reasonable value.
        - When you list the list, use a numeric ordered list.
        - You always have to convert the full list to Grocery object after you finished writing it.
        """,
    )

extractor = Agent(
  model='azure:gpt-4o',
  output_type=list[Grocery],
  system_prompt="""
    # Extractor agent

    ## Description
    - You're an agent whose work is manipulate groceries and groceries list
    - Alwas return an array containing all the items from the list
    """
)

@agent.tool
async def convert_to_array(ctx: RunContext, agent_output: str):
  """
    Use this tool if you need to convert agent outputs to arrays
    - Convert the agent output to Grocery array
    - Before converting, check if there's a list already existing and add the corresponding list id to the grocery, otherwise, create the list first then add the list id
  """
  print(agent_output)
  print("Converting list to array")
  res = await extractor.run(agent_output)
  for extracted in res.output:
    execute_query("INSERT INTO groceries (name, description, amount, price, list_id) VALUES (?, ? , ?, ?, ?)", (extracted.name, extracted.description, extracted.amount, extracted.price, extracted.list_id))

@extractor.tool
async def get_grocery_list_by_name(ctx: RunContext, name:str):
  """
    Use this tool to get a query by its name if you don't know the ID
    - If you don't find a list related to the grocery list or you can't find the list, then use the create grocery list tool
  """
  res = (f"SELECT * FROM lists WHERE name LIKE %{name}%", ())
  return res

@extractor.tool
async def create_grocery_list(ctx: RunContext, list_name: str, list_description: str):
  """
    Use this tool if you need to create a grocery list for a new list of groceries
    - Always create a grocery list if there are no matching names and descriptions in the database
    - Use the context of the conversation to choose a name for the list. Examples:
      - "Create a list for chicken rice" -> name: Chicken rice
      - "I want to make spagetthi" -> name: Spagetthi
  """
  print(f"Creating grocery list for {list_name}")
  res = execute_query("INSERT INTO lists (name, description, completed) VALUES (?, ?, ?)", (list_name, list_description, 0))
  return res

def to_model_message(msg: Message):
  return ModelRequest.user_text_prompt(msg.content) if msg.role == "user" else ModelResponse(parts=[TextPart(content=msg.content)])

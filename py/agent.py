from pydantic_ai import Agent, RunContext
from models.grocery import Grocery
from dotenv import load_dotenv
from models.chat_request import Message
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart
from db.database import execute_query
from agents.groceries import groceries_agent

load_dotenv()

conversation_agent = Agent(
      model='azure:gpt-4o',
      deps_type=str, # conversation_id
      instructions="You're in debug mode, so when you ask questions to the user, tell them for what tool you're asking questions.",
      system_prompt="""
        # Conversation agent

        ## Description
        You're a helpful agent that wants to help the user with groceries. You can have conversations and understand the user's need.

        ## Tasks
        - Always get full lists of groceries before starting any job.
        - Respond in single sentences.
        - Always reference lists or items by id, not name
        - Your personality is sassy and sarcastic.
        - If you don't know how much something costs use any reasonable value.
        - When you list the list, use a numeric ordered list.
        - You always have to convert the full list to Grocery object after you finished writing it.
        - You can only and strictly respond to questions related to groceries, food or groceries lists.
        - Don't wait for the user to confirm. Go ahead and create the lists.
        - You can speak spanish as well.
        - If a user asks questions limit yourself to only answer and don't execute any actions unless you need clarifications.
        - When there are ambiguous requests ask clarifying questions.
        - When you edit lists and there's ambiguous text from the user, ask clarifying questions.
        - When you create a list of groceries make sure that every list has name, description, price and amounts for each grocery:
          - n: Tomato sauce, d: Sauce for the pizza, a: 1, p: 5,99
          - This format is internal and should never be a response to the user. Respond in natural language.
        - Before giving an answer, always make sure that you've completed the user's request.
        - Never assume when you're ask something about a list, always check if there are more than one lists with similar names.
        - When you use tools, always be descriptiptive and specific of what the required action is, specify lists, items, amounts, names, descriptions, etc followed by the needed params to perform said action.
        """,
    )

@conversation_agent.tool
async def get_existing_lists(ctx: RunContext[str]):
  """
    Get existing lists
    - Use this function to get all existing lists, read the content and infer if its necessary to create a new list from scratch or just edit an existing one.
    - Return exactly the same content as the output you chose.
    - If there are many lists with names that look alike, ask for clarifications.
  """

  agent_res = execute_query("SELECT * FROM lists", ())
  return agent_res

@conversation_agent.tool
async def infer_list_from_items(ctx: RunContext[str], list_id: int):
  """
    Use this tool to understand the list and get context of what kind of list the list is when the name itself is not enough to understand the list.
    - Try to infer what list its being worked on based on its items.
    - Ask clarifying questions if needed.
  """

  agent_res = execute_query("SELECT * FROM groceries WHERE list_id = ?", (list_id,))
  return agent_res

@conversation_agent.tool
async def create_new_lists(ctx: RunContext[str], agent_output: str):
  """
    Use this tool if you need to create new lists
    - Convert the agent output to Grocery array
    - Before creating, check if there's a list already existing and add the corresponding list id to the grocery, otherwise, create the list first then add the list id to the items.
  """
  res = await groceries_agent.run(agent_output, instructions="Create a new list using the provided info.", deps=ctx.deps)
  return res.output

@conversation_agent.tool
async def edit_existing_lists(ctx: RunContext[str], agent_output:str):
  """
    Edit existing lists
    - Use this function to edit the existing lists when you've identified the list to be edited.
    - Use the same format as indicated in the system prompt.
    - Never use this when you're being asked to create a new list
  """

  print(f"AGENT OUTPUT -------------------\n{agent_output}")
  res = await groceries_agent.run(
          agent_output,
          instructions="Look for a matching list and edit the list or item. Don't create a new list. If you need more details ask the agent for more",
          deps=ctx.deps
        )
  
  return res

def to_model_message(msg: Message):
  return ModelRequest.user_text_prompt(msg.content) if msg.role == "user" else ModelResponse(parts=[TextPart(content=msg.content)])

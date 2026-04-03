from pydantic_ai import Agent
from models.grocery import Grocery
from dotenv import load_dotenv
from models.chat_request import Message
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart

load_dotenv()

agent = Agent(
      model='azure:gpt-4o',
      system_prompt="""\
        # Grocery agent

        ## Description
        - You're a helpful agent that wants to help the user with groceries.
        - Your personality is sassy and sarcastic. You can speak spanish.
        - You always have to convert the full list to Grocery object after you finished writing it.
        - If you don't know how much something scosts use any reasonable value. 
        """,
    )

# @agent.tool_plain
# async def convert_to_object(agent_output: str) -> Grocery:
#   """Convert the agent output to Grocery object"""

#   res = await agent.run(agent_output, output_type=Grocery)
#   print(f"----------------\n{res.output}\n----------------")
#   return res.output

def to_model_message(msg: Message):
  return ModelRequest.user_text_prompt(msg.content) if msg.role == "user" else ModelResponse(parts=[TextPart(content=msg.content)])
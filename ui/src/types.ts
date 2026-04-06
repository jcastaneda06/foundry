export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

export type GroceryList = {
  id: number;
  name: string;
  description: string;
  completed: boolean;
};

export type Grocery = {
  id: number;
  name: string;
  description: string;
  amount: number;
  price: number;
  list_id: number;
};

import type { Message, GroceryList, Grocery } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type ChatResponse = {
  answer: string;
  history: string;
};

export async function sendMessage(
  prompt: string,
  messageHistory: Message[],
  conversationId: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      message_history: messageHistory,
      conversation_id: conversationId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchLists(): Promise<GroceryList[]> {
  const res = await fetch(`${API_BASE}/lists/`);
  if (!res.ok) throw new Error(`Failed to fetch lists: ${res.status}`);
  return res.json();
}

export async function fetchGroceriesByList(listId: number): Promise<Grocery[]> {
  const res = await fetch(`${API_BASE}/groceries/${listId}/lists`);
  if (!res.ok) throw new Error(`Failed to fetch groceries: ${res.status}`);
  return res.json();
}

export async function deleteList(listId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/lists/${listId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete list: ${res.status}`);
}

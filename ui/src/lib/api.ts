import type { Message } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type ChatResponse = {
  answer: string;
  history: string;
};

export async function sendMessage(
  prompt: string,
  messageHistory: Message[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      message_history: messageHistory,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  return res.json();
}

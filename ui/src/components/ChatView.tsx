import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/MessageBubble";
import { sendMessage } from "@/lib/api";
import type { Conversation } from "@/types";
import { SendHorizonal } from "lucide-react";

type Props = {
  conversation: Conversation;
  onUpdate: (conversation: Conversation) => void;
};

export function ChatView({ conversation, onUpdate }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || loading) return;

    const userMessage = { role: "user" as const, content: prompt };
    const updatedMessages = [...conversation.messages, userMessage];
    const title =
      conversation.messages.length === 0
        ? prompt.slice(0, 40)
        : conversation.title;

    const updated = { ...conversation, title, messages: updatedMessages };
    onUpdate(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(prompt, conversation.messages, conversation.id);
      const assistantMessage = {
        role: "assistant" as const,
        content: res.answer,
      };
      onUpdate({
        ...updated,
        messages: [...updatedMessages, assistantMessage],
      });
    } catch {
      onUpdate({
        ...updated,
        messages: [
          ...updatedMessages,
          {
            role: "assistant" as const,
            content: "Sorry, something went wrong. Please try again.",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 max-w-2xl mx-auto">
          {conversation.messages.length === 0 && (
            <p className="text-muted-foreground text-center mt-20 text-sm">
              Send a message to start the conversation.
            </p>
          )}
          {conversation.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 max-w-2xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

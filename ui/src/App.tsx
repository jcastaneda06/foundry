import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatView } from "@/components/ChatView";
import { GroceryPanel } from "@/components/GroceryPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { loadConversations, saveConversations } from "@/lib/storage";
import type { Conversation } from "@/types";
import { Menu } from "lucide-react";

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations()
  );
  const [activeId, setActiveId] = useState<string | null>(
    () => conversations[0]?.id ?? null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleNew = useCallback(() => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: "",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(() => {
          const remaining = conversations.filter((c) => c.id !== id);
          return remaining[0]?.id ?? null;
        });
      }
    },
    [activeId, conversations]
  );

  const handleUpdate = useCallback((updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }, []);

  const sidebarContent = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      onSelect={(id) => {
        setActiveId(id);
        setSidebarOpen(false);
      }}
      onNew={handleNew}
      onDelete={handleDelete}
    />
  );

  return (
    <div className="flex h-dvh bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 border-r">{sidebarContent}</div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 md:hidden z-10"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <ChatView
            key={activeConversation.id}
            conversation={activeConversation}
            onUpdate={handleUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No conversation selected
              </p>
              <Button onClick={handleNew}>Start a new chat</Button>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar — grocery lists */}
      {activeConversation && <GroceryPanel />}
    </div>
  );
}

export default App;

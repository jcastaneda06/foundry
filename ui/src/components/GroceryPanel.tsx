import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { fetchLists, fetchGroceriesByList, deleteList } from "@/lib/api";
import type { GroceryList, Grocery } from "@/types";
import { cn } from "@/lib/utils";
import {
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  ListChecks,
  Loader2,
  Trash2,
} from "lucide-react";

export function GroceryPanel() {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [expandedListId, setExpandedListId] = useState<number | null>(null);
  const [groceries, setGroceries] = useState<Record<number, Grocery[]>>({});
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingItems, setLoadingItems] = useState<number | null>(null);

  useEffect(() => {
    if (open && lists.length === 0) {
      loadLists();
    }
  }, [open]);

  async function loadLists() {
    setLoadingLists(true);
    try {
      const data = await fetchLists();
      setLists(data);
    } catch {
      // silently fail — user can retry by toggling
    } finally {
      setLoadingLists(false);
    }
  }

  async function toggleList(listId: number) {
    if (expandedListId === listId) {
      setExpandedListId(null);
      return;
    }
    setExpandedListId(listId);

    if (!groceries[listId]) {
      setLoadingItems(listId);
      try {
        const items = await fetchGroceriesByList(listId);
        setGroceries((prev) => ({ ...prev, [listId]: items }));
      } catch {
        setGroceries((prev) => ({ ...prev, [listId]: [] }));
      } finally {
        setLoadingItems(null);
      }
    }
  }

  async function handleDelete(listId: number) {
    try {
      await deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      if (expandedListId === listId) setExpandedListId(null);
      const { [listId]: _, ...rest } = groceries;
      setGroceries(rest);
    } catch {
      // silently fail
    }
  }

  function handleRefresh() {
    setLists([]);
    setGroceries({});
    setExpandedListId(null);
    loadLists();
  }

  return (
    <div className="flex h-full">
      {/* Toggle button — always visible */}
      <div className="flex flex-col items-center pt-3 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          title={open ? "Close grocery panel" : "Open grocery panel"}
        >
          {open ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Panel content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out border-l",
          open ? "w-72" : "w-0 border-l-0"
        )}
      >
        <div className="flex flex-col h-full w-72">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Grocery Lists</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={loadingLists}
              title="Refresh lists"
            >
              <Loader2
                className={cn(
                  "h-3.5 w-3.5",
                  loadingLists && "animate-spin"
                )}
              />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loadingLists && lists.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loadingLists && lists.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No grocery lists yet
                </p>
              )}

              {lists.map((list) => (
                <div key={list.id}>
                  <div
                    onClick={() => toggleList(list.id)}
                    className={cn(
                      "group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors cursor-pointer",
                      expandedListId === list.id && "bg-muted/50"
                    )}
                  >
                    {expandedListId === list.id ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <ListChecks
                      className={cn(
                        "h-4 w-4 shrink-0",
                        list.completed
                          ? "text-green-500"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate flex-1">{list.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(list.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive-foreground transition-opacity shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {expandedListId === list.id && (
                    <div className="ml-6 pl-3 border-l border-border space-y-1 py-1">
                      {list.description && (
                        <p className="text-xs text-muted-foreground px-2 pb-1">
                          {list.description}
                        </p>
                      )}

                      {loadingItems === list.id && (
                        <div className="flex items-center gap-2 px-2 py-1">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      )}

                      {groceries[list.id]?.length === 0 &&
                        loadingItems !== list.id && (
                          <p className="text-xs text-muted-foreground px-2">
                            No items in this list
                          </p>
                        )}

                      {groceries[list.id]?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-muted/30"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="truncate font-medium">
                              {item.name}
                            </span>
                            {item.description && (
                              <span className="truncate text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2 text-muted-foreground">
                            <span>x{item.amount}</span>
                            <span>${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

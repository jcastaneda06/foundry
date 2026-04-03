import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm prose-invert"
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              code: ({ children, className }) => {
                const isBlock = className?.startsWith("language-");
                return isBlock ? (
                  <code
                    className={cn(
                      "block bg-foreground/10 rounded-lg p-3 my-2 overflow-x-auto text-xs",
                      className
                    )}
                  >
                    {children}
                  </code>
                ) : (
                  <code className="bg-foreground/10 rounded px-1 py-0.5 text-xs">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <pre className="not-prose">{children}</pre>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              table: ({ children }) => (
                <table className="border-collapse my-2 text-xs w-full">
                  {children}
                </table>
              ),
              th: ({ children }) => (
                <th className="border border-foreground/20 px-2 py-1 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-foreground/20 px-2 py-1">
                  {children}
                </td>
              ),
            }}
          >
            {message.content}
          </Markdown>
        )}
      </div>
    </div>
  );
}

"use client";

import { FC } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/ai/use-chat-store";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-orange-100" : "bg-blue-100"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-orange-700" />
        ) : (
          <Bot className="w-4 h-4 text-blue-700" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isUser
            ? "bg-orange-600 text-white"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.timestamp && (
          <p
            className={cn(
              "text-xs mt-1",
              isUser ? "text-orange-200" : "text-muted-foreground"
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
};

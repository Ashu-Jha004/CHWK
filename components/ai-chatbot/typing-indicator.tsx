"use client";

import { FC } from "react";
import { Bot } from "lucide-react";

export const TypingIndicator: FC = () => {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-blue-700" />
      </div>

      {/* Animated Dots */}
      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

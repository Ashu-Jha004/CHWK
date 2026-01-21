"use client";

import * as React from "react";

import { FC } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/ai/use-chat-store";
import { ChatInterface } from "@/components/ai-chatbot/chat-interface";
import { cn } from "@/lib/utils";

interface ChatbotWidgetProps {
  businessId: string;
  businessName: string;
}

export const ChatbotWidget: FC<ChatbotWidgetProps> = ({ businessId, businessName }) => {
  const { isOpen, toggleChat, setBusinessId } = useChatStore();

  // Set business ID on mount
  React.useEffect(() => {
    setBusinessId(businessId);
  }, [businessId, setBusinessId]);

  return (
    <>
      {/* Floating Chat Window */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-in-out",
          // Mobile positions (full screen)
          "inset-0",
          // Desktop positions (reset mobile full screen)
          "sm:inset-auto sm:bottom-10 sm:right-4",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className={cn(
          "bg-background border border-border flex flex-col overflow-hidden shadow-2xl",
          // Mobile dimensions
          "w-full h-full rounded-none",
          // Desktop dimensions
          "sm:w-[380px] sm:h-[600px] sm:rounded-2xl"
        )}>
          {/* Chat Interface (Includes its own header now) */}
          <ChatInterface />
        </div>
      </div>

      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "scale-0" : "scale-100"
        )}
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </>
  );
};

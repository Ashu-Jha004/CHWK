// Chat state management hook
import { create } from "zustand";
import { nanoid } from "nanoid";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface ChatStore {
  sessionId: string | null;
  businessId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  // Actions
  setBusinessId: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: null,
  businessId: "",
  messages: [],
  isLoading: false,
  isOpen: false,
  error: null,

  setBusinessId: (id: string) => set({ businessId: id }),

  sendMessage: async (content: string) => {
    const { sessionId, businessId, messages } = get();

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    set({ messages: [...messages, userMessage], isLoading: true, error: null });

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          businessId,
          message: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to send message`);
      }

      // Handle streaming response
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";
      let newSessionId: string | null = sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "session") {
              newSessionId = data.sessionId;
              set({ sessionId: data.sessionId });
            } else if (data.type === "token") {
              aiMessage += data.content;
              // Update AI message in real-time
              set(state => {
                const msgs = [...state.messages];
                const lastMsg = msgs[msgs.length - 1];

                if (lastMsg && lastMsg.role === "assistant") {
                  lastMsg.content = aiMessage;
                } else {
                  msgs.push({
                    role: "assistant",
                    content: aiMessage,
                    timestamp: new Date(),
                  });
                }

                return { messages: msgs };
              });
            } else if (data.type === "done") {
              // Final message update
              set(state => {
                const msgs = [...state.messages];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg && lastMsg.role === "assistant") {
                  lastMsg.content = data.fullMessage;
                }
                return { messages: msgs };
              });
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          }
        }
      }

      set({ isLoading: false });
    } catch (error: any) {

      // If we have some message content, don't show a global error state
      const { messages } = get();
      const lastMsg = messages[messages.length - 1];
      const hasContent = lastMsg?.role === "assistant" && lastMsg.content.length > 0;

      if (hasContent) {
        console.warn("[Chat Error] Partial success (content received but stream failed):", error);
      } else {
        console.error("[Chat Error]:", error);
        set({
          error: error.message || "Failed to send message"
        });
      }

      set({ isLoading: false });
    }
  },

  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),

  clearChat: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await fetch(`/api/ai/chat?sessionId=${sessionId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    }
    set({ messages: [], sessionId: null, error: null });
  },

  setError: (error: string | null) => set({ error }),
}));

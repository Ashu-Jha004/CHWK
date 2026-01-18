import { useEffect, useRef } from "react";
import { ChatMessage } from "./use-chat-store";
import { useSpeechSynthesis } from "./use-speech-synthesis";

interface UseAutoSpeechProps {
  messages: ChatMessage[];
  isLoading: boolean;
  voiceModeEnabled: boolean;
  tts: ReturnType<typeof useSpeechSynthesis>;
}

export function useAutoSpeech({
  messages,
  isLoading,
  voiceModeEnabled,
  tts,
}: UseAutoSpeechProps) {
  const lastProcessedMessageIndexRef = useRef(messages.length - 1);

  useEffect(() => {
    // We only trigger speech if:
    // 1. Voice mode is enabled
    // 2. TTS is supported
    // 3. We are NOT currently loading/generating a response (wait for full message)
    if (isLoading) return;

    if (!voiceModeEnabled || !tts.isSupported) {
      return;
    }

    const lastIndex = messages.length - 1;

    // Check if there is a NEW message that we haven't processed yet
    if (lastIndex > lastProcessedMessageIndexRef.current) {
      const lastMessage = messages[lastIndex];

      // Only speak if it's an assistant message
      if (lastMessage?.role === "assistant") {
        console.log("[TTS] Speaking message:", lastMessage.content.substring(0, 50) + "...");
        tts.speak(lastMessage.content);
      }

      // Update our tracker so we don't speak this message again
      // We update it regardless of role effectively "skipping" user messages
      lastProcessedMessageIndexRef.current = lastIndex;
    }
  }, [messages, isLoading, voiceModeEnabled, tts]);
}

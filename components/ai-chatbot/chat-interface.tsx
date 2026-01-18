"use client";

import { FC, useRef, useEffect, useState, useCallback } from "react";
import { Send, Loader2, AlertCircle, Volume2, VolumeX, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/hooks/ai/use-chat-store";
import { MessageBubble } from "@/components/ai-chatbot/message-bubble";
import { TypingIndicator } from "@/components/ai-chatbot/typing-indicator";
import { VoiceButton } from "./voice-button";
import { VoiceVisualizer } from "./voice-visualizer";
import { useVoiceInput } from "@/hooks/ai/use-voice-input";
import { useSpeechSynthesis } from "@/hooks/ai/use-speech-synthesis";
import { useAutoSpeech } from "@/hooks/ai/use-auto-speech";
import { TooltipProvider } from "@/components/ui/tooltip";

export const ChatInterface: FC = () => {
  const { messages, isLoading, error, sendMessage, clearChat, toggleChat } = useChatStore();
  const [input, setInput] = useState("");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice input hook
  const voiceInput = useVoiceInput({
    onResult: (transcript) => {
      // When voice input completes, add to input or send directly
      if (transcript.trim()) {
        setInput((prev) => prev + transcript);
      }
    },
    onInterimResult: (interim) => {
      // Show interim results in input field
      if (voiceInput.isListening) {
        setInput(voiceInput.transcript + interim);
      }
    },
    silenceTimeout: 2000, // Stop after 2s of silence
  });

  // Text-to-speech hook
  const tts = useSpeechSynthesis({
    rate: 1.0,
    pitch: 1.0,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle auto-speech (TTS)
  useAutoSpeech({
    messages,
    isLoading,
    voiceModeEnabled,
    tts,
  });

  // Update input when transcript changes
  useEffect(() => {
    if (voiceInput.isListening) {
      setInput(voiceInput.transcript + voiceInput.interimTranscript);
    }
  }, [voiceInput.transcript, voiceInput.interimTranscript, voiceInput.isListening]);

  // Handle sending message after voice input stops
  useEffect(() => {
    if (!voiceInput.isListening && voiceInput.transcript.trim() && voiceModeEnabled) {
      // Auto-send after voice input completes
      const message = voiceInput.transcript.trim();
      if (message) {
        handleSend(message);
        voiceInput.resetTranscript();
      }
    }
  }, [voiceInput.isListening]);

  const handleSend = useCallback(async (messageOverride?: string) => {
    const message = messageOverride || input.trim();
    if (!message || isLoading) return;

    setInput("");
    voiceInput.resetTranscript();
    await sendMessage(message);
  }, [input, isLoading, sendMessage, voiceInput]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceMode = () => {
    if (voiceModeEnabled) {
      // Turning off - stop any speech
      tts.stop();
      voiceInput.stopListening();
    }
    setVoiceModeEnabled(!voiceModeEnabled);
  };

  const handleVoiceStart = () => {
    // Stop any TTS before recording
    tts.stop();
    // Auto-enable voice output when using voice input
    setVoiceModeEnabled(true);
    voiceInput.startListening();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me anything</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleChat}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Welcome! 👋</h3>
              <p className="text-sm text-muted-foreground">
                I'm your AI assistant. Ask me anything about our services, hours, or location!
              </p>
              {voiceInput.isSupported && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Click the microphone to use voice input
                </p>
              )}
            </div>
          )}

          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {(error || voiceInput.error) && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error || voiceInput.error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Visualizer */}
        {voiceInput.isListening && (
          <div className="px-4 py-2 border-t border-border bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-orange-600 font-medium">Listening...</span>
              <VoiceVisualizer isActive={voiceInput.isListening} />
            </div>
          </div>
        )}

        {/* TTS Indicator */}
        {tts.isSpeaking && (
          <div className="px-4 py-2 border-t border-border bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-xs text-blue-600 font-medium">Speaking...</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={tts.stop}
                className="text-xs h-6 px-2"
              >
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex gap-2 items-center">
            {/* Voice Mode Toggle */}
            <Button
              variant={voiceModeEnabled ? "default" : "ghost"}
              size="icon"
              onClick={toggleVoiceMode}
              className={voiceModeEnabled ? "bg-orange-500 hover:bg-orange-600" : ""}
              title={voiceModeEnabled ? "Voice mode on (auto-speak replies)" : "Voice mode off"}
            >
              {voiceModeEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Voice Input Button */}
            <VoiceButton
              isListening={voiceInput.isListening}
              isLoading={isLoading}
              isSupported={voiceInput.isSupported}
              error={voiceInput.error}
              onStart={handleVoiceStart}
              onStop={voiceInput.stopListening}
            />

            {/* Text Input */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={voiceInput.isListening ? "Listening..." : "Type your message..."}
              disabled={isLoading || voiceInput.isListening}
              className="flex-1"
            />

            {/* Send Button */}
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear conversation
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

// Text-to-Speech hook using Web Speech API
"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  language?: string;
  onEnd?: () => void;
  onStart?: () => void;
  onError?: (error: string) => void;
}

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    voiceName,
    language = "en-US",
    onEnd,
    onStart,
    onError,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Auto-select a good voice
      if (!selectedVoice && availableVoices.length > 0) {
        // Prefer natural-sounding voices
        const preferredVoice =
          availableVoices.find((v) => v.name === voiceName) ||
          availableVoices.find((v) => v.lang.startsWith(language.split("-")[0]) && v.name.includes("Natural")) ||
          availableVoices.find((v) => v.lang.startsWith(language.split("-")[0]) && v.name.includes("Google")) ||
          availableVoices.find((v) => v.lang.startsWith(language.split("-")[0])) ||
          availableVoices[0];

        if (preferredVoice) {
          setSelectedVoice(preferredVoice);
        }
      }
    };

    loadVoices();

    // Voices load asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceName, language, selectedVoice]);

  // Speak text
  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        onError?.("Speech synthesis is not supported");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error("[TTS Error]:", event.error);
        setIsSpeaking(false);
        setIsPaused(false);
        onError?.(event.error);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch, volume, selectedVoice, onStart, onEnd, onError]
  );

  // Pause speech
  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  // Resume speech
  const resume = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Stop speech
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    speak,
    pause,
    resume,
    stop,
    setVoice,
  };
}

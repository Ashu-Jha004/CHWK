"use client";

import { FC, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const VoiceVisualizer: FC<VoiceVisualizerProps> = ({
  isActive,
  className,
  barCount = 5,
  minHeight = 4,
  maxHeight = 24,
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(
    Array(barCount).fill(minHeight)
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Reset to minimum when not active
      setAudioLevels(Array(barCount).fill(minHeight));
      return;
    }

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevels = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Map frequency data to bar heights
          const levels = [];
          const segmentSize = Math.floor(dataArray.length / barCount);

          for (let i = 0; i < barCount; i++) {
            const start = i * segmentSize;
            const end = start + segmentSize;
            let sum = 0;

            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }

            const avg = sum / segmentSize;
            const normalized = (avg / 255) * (maxHeight - minHeight) + minHeight;
            levels.push(Math.round(normalized));
          }

          setAudioLevels(levels);
          animationFrameRef.current = requestAnimationFrame(updateLevels);
        };

        updateLevels();
      } catch (error) {
        console.error("[VoiceVisualizer] Failed to access microphone:", error);
        // Show animated fallback
        animateFallback();
      }
    };

    const animateFallback = () => {
      const animate = () => {
        setAudioLevels(
          Array(barCount)
            .fill(0)
            .map(() => Math.random() * (maxHeight - minHeight) + minHeight)
        );
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    setupAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, barCount, minHeight, maxHeight]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 h-8",
        className
      )}
    >
      {audioLevels.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-orange-500 rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
};

"use client";

import { FC } from "react";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceButtonProps {
  isListening: boolean;
  isLoading?: boolean;
  isSupported: boolean;
  error?: string | null;
  onStart: () => void;
  onStop: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export const VoiceButton: FC<VoiceButtonProps> = ({
  isListening,
  isLoading = false,
  isSupported,
  error,
  onStart,
  onStop,
  className,
  size = "icon",
}) => {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  if (!isSupported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            disabled
            className={cn("text-muted-foreground", className)}
          >
            <MicOff className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voice input not supported in this browser</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (error) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleClick}
            className={cn("text-destructive hover:text-destructive", className)}
          >
            <AlertCircle className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{error}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isListening ? "destructive" : "ghost"}
          size={size}
          onClick={handleClick}
          className={cn(
            "transition-all duration-200",
            isListening && "animate-pulse",
            className
          )}
        >
          {isListening ? (
            <Mic className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isListening ? "Stop recording" : "Start voice input"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

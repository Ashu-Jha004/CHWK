// components/shared/time-picker.tsx
"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  error,
  placeholder = "HH:MM",
  className,
}: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d:]/g, "");

    // Auto-format as user types
    if (input.length === 2 && !input.includes(":")) {
      input = input + ":";
    }

    // Limit to HH:MM format
    if (input.length > 5) {
      input = input.substring(0, 5);
    }

    onChange(input);
  };

  const handleBlur = () => {
    if (!value) return;

    // Parse and validate time
    const parts = value.split(":");
    if (parts.length === 2) {
      let hours = parseInt(parts[0], 10);
      let minutes = parseInt(parts[1], 10);

      // Clamp values
      hours = Math.min(23, Math.max(0, hours));
      minutes = Math.min(59, Math.max(0, minutes));

      // Format with leading zeros
      const formatted = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      onChange(formatted);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "pl-10 font-mono",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        maxLength={5}
      />
      <Clock
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
          disabled && "opacity-50"
        )}
      />
    </div>
  );
}

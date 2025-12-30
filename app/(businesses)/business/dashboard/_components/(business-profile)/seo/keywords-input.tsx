// components/business-dashboard/seo/keywords-input.tsx
"use client";

import React, { useState, useCallback, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSEODialogStore } from "@/store/business-dashboard/use-seo-dialog-store";

export function KeywordsInput() {
  const [inputValue, setInputValue] = useState("");
  const { tempKeywords, addKeyword, removeKeyword } = useSEODialogStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const tag = inputValue.trim();
        if (tag && tempKeywords.length < 25) {
          addKeyword(tag);
          setInputValue("");
        }
      } else if (
        e.key === "Backspace" &&
        !inputValue &&
        tempKeywords.length > 0
      ) {
        removeKeyword(tempKeywords[tempKeywords.length - 1]);
      }
    },
    [inputValue, tempKeywords, addKeyword, removeKeyword]
  );

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all",
          tempKeywords.length >= 25 && "opacity-80"
        )}
      >
        {tempKeywords.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-2 pr-1 py-1 gap-1 animate-in fade-in zoom-in duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeKeyword(tag)}
              className="hover:bg-muted rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            tempKeywords.length < 25
              ? "Add keywords (Enter or comma)..."
              : "Limit reached"
          }
          disabled={tempKeywords.length >= 25}
          className="flex-1 bg-transparent outline-none text-sm min-w-[120px] disabled:cursor-not-allowed"
          aria-label="Keywords input"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {tempKeywords.length}/25 keywords. Use comma or Enter to add.
      </p>
    </div>
  );
}

// components/reviews/helpful-vote-button.tsx

"use client";

import { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface HelpfulVoteButtonProps {
  reviewId: string;
  initialHelpfulCount: number;
  initialNotHelpfulCount: number;
  userVote: { isHelpful: boolean } | null;
  disabled?: boolean;
}

/**
 * Helpful Vote Button Component
 * Allows users to vote if a review was helpful or not
 */
export function HelpfulVoteButton({
  reviewId,
  initialHelpfulCount,
  initialNotHelpfulCount,
  userVote,
  disabled = false,
}: HelpfulVoteButtonProps) {
  const router = useRouter();
  const [isVoting, setIsVoting] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount);
  const [currentVote, setCurrentVote] = useState<{ isHelpful: boolean } | null>(userVote);

  // ============================================
  // VOTE HANDLER
  // ============================================
  const handleVote = useCallback(
    async (isHelpful: boolean) => {
      if (disabled || isVoting) return;

      setIsVoting(true);

      try {
        const response = await fetch("/api/reviews/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewId,
            isHelpful,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to record vote");
        }

        // Update local state
        setHelpfulCount(result.helpfulCount);
        setNotHelpfulCount(result.notHelpfulCount);

        if (result.voteRemoved) {
          setCurrentVote(null);
          toast.success("Vote removed");
        } else {
          setCurrentVote({ isHelpful: result.userVote.isHelpful });
          toast.success(isHelpful ? "Marked as helpful" : "Marked as not helpful");
        }

        // Refresh to update UI
        router.refresh();
      } catch (error) {
        console.error("Vote error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to record vote"
        );
      } finally {
        setIsVoting(false);
      }
    },
    [reviewId, disabled, isVoting, router]
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(true)}
        disabled={disabled || isVoting}
        className={cn(
          "gap-2 transition-colors",
          currentVote?.isHelpful && "text-primary bg-primary/10"
        )}
      >
        <ThumbsUp
          className={cn(
            "h-4 w-4",
            currentVote?.isHelpful && "fill-current"
          )}
        />
        Helpful ({helpfulCount})
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(false)}
        disabled={disabled || isVoting}
        className={cn(
          "gap-2 transition-colors",
          currentVote?.isHelpful === false && "text-destructive bg-destructive/10"
        )}
      >
        <ThumbsDown
          className={cn(
            "h-4 w-4",
            currentVote?.isHelpful === false && "fill-current"
          )}
        />
        Not Helpful ({notHelpfulCount})
      </Button>
    </div>
  );
}

// app/business/dashboard/_components/video/video-management-dialog.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, Trash2, Save, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/utils/video-helper";
import { useVideoActions } from "@/hooks/business-dashboard/use-video-actions";
import { cn } from "@/lib/utils";

interface VideoManagementDialogProps {
  businessId: string;
  currentVideoUrl?: string | null;
}

export function VideoManagementDialog({
  businessId,
  currentVideoUrl
}: VideoManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(currentVideoUrl || "");
  const { mutate, isPending } = useVideoActions(businessId);

  // Memoized YouTube Embed URL to optimize performance
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(urlInput), [urlInput]);

  const handleAction = useCallback((isDelete: boolean = false) => {
    const targetUrl = isDelete ? null : urlInput;

    mutate(targetUrl, {
      onSuccess: () => {
        if (isDelete) setUrlInput("");
        setTimeout(() => setOpen(false), 1500); // Close after showing success state
      },
    });
  }, [mutate, urlInput]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={currentVideoUrl ? "outline" : "default"}
          className={cn(
            "gap-2 transition-all duration-300",
            !currentVideoUrl && "bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          )}
        >
          <Youtube className="h-4 w-4" />
          {currentVideoUrl ? "Update Video" : "Add Intro Video"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] glass border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-cal text-2xl text-[#004E89]">Intro Video</DialogTitle>
          <DialogDescription>
            Add a YouTube link to showcase your business to customers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="pr-10 focus-visible:ring-[#FF6B35]"
              />
              {urlInput && (
                <button
                  onClick={() => setUrlInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Preview Player Section */}
          <div className={cn(
            "aspect-video w-full overflow-hidden rounded-xl border border-white/20 bg-muted/50 transition-all duration-500",
            embedUrl ? "opacity-100 scale-100" : "opacity-50 scale-[0.98]"
          )}>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Youtube className="h-12 w-12 opacity-20" />
                <p className="text-sm">Enter a valid link to preview</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {currentVideoUrl && (
            <Button
              variant="destructive"
              onClick={() => handleAction(true)}
              disabled={isPending}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          <Button
            onClick={() => handleAction(false)}
            disabled={isPending || !embedUrl || urlInput === currentVideoUrl}
            className="gap-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 min-w-[120px]"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {currentVideoUrl ? "Update" : "Save Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
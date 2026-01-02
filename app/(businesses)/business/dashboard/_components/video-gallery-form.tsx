// app/business/dashboard/_components/video-gallery-form.tsx
"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { Photo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VideoSchema, VideoFormValues, getYouTubeID } from "@/lib/video";
import { addBusinessVideo, deleteBusinessVideo } from "@/app/(businesses)/business/actions/video-actions"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Video as VideoIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGalleryFormProps {
  businessId: string;
  initialVideos: Photo[];
}

export function VideoGalleryForm({ businessId, initialVideos }: VideoGalleryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<VideoFormValues>({
    resolver: zodResolver(VideoSchema),
    defaultValues: { url: "", caption: "" }
  });

  const currentUrl = watch("url");
  const previewId = useMemo(() => getYouTubeID(currentUrl), [currentUrl]);

  const onSubmit = useCallback(async (values: VideoFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await addBusinessVideo(businessId, values);
      if (result.success) {
        reset();
      } else {
        setError(result.error || "Failed to add video");
      }
    });
  }, [businessId, reset]);

  const onDelete = useCallback(async (videoId: string) => {
    if (!confirm("Are you sure you want to remove this video?")) return;

    startTransition(async () => {
      const result = await deleteBusinessVideo(videoId, businessId);
      if (!result.success) setError(result.error || "Failed to delete video");
    });
  }, [businessId]);

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 rounded-2xl border-white/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <VideoIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Add Business Video</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              {...register("url")}
              placeholder="Paste YouTube Link (e.g., https://youtube.com/watch?v=...)"
              className={cn("bg-white/50 backdrop-blur-sm", errors.url && "border-destructive")}
              disabled={isPending}
            />
            {errors.url && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <Input
              {...register("caption")}
              placeholder="Video Caption (Optional)"
              className="bg-white/50 backdrop-blur-sm"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Live Preview of Input */}
        {previewId && (
          <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/20 shadow-inner max-w-sm mx-auto">
             <iframe
                src={`https://www.youtube.com/embed/${previewId}`}
                className="w-full h-full"
                allowFullScreen
                title="Preview"
              />
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold transition-all card-hover">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add to Gallery
        </Button>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </form>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialVideos.map((video) => {
          const videoId = getYouTubeID(video.url);
          return (
            <div key={video.id} className="group relative glass rounded-2xl overflow-hidden border-white/20 card-hover transition-all duration-300">
              <div className="aspect-video bg-muted">
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                    title={video.caption || "Business Video"}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic text-xs">Invalid link</div>
                )}
              </div>

              <div className="p-3 flex justify-between items-center bg-black/5 backdrop-blur-md">
                <span className="text-sm font-medium truncate pr-4">{video.caption || "Untitled Video"}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(video.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
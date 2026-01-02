// components/business/video-preview-grid.tsx
"use client";

import { useState, useMemo } from "react";
import { Photo } from "@prisma/client";
import { getYouTubeID} from "@/lib/video";
import { Play } from "lucide-react";


interface VideoPreviewGridProps {
  videos: Photo[];
}

export function VideoPreviewGrid({ videos }: VideoPreviewGridProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-secondary rounded-full" />
        Videos & Virtual Tours
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({ video }: { video: Photo }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = useMemo(() => getYouTubeID(video.url), [video.url]);

  if (!videoId) return null;

  // Optimized YouTube Thumbnail URL (hqdefault is standard for 16:9)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="group relative aspect-video rounded-3xl overflow-hidden glass border-white/20 card-hover shadow-lg bg-black">
      {!isLoaded ? (
        <button
          onClick={() => setIsLoaded(true)}
          className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          aria-label="Play video"
        >
          {/* Background Thumbnail with Overlay */}
          <img
            src={thumbnailUrl}
            alt={video.caption || "Business Video"}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="lazy"
          />

          {/* Glassmorphic Play Button */}
          <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl transition-all group-hover:bg-primary group-hover:border-primary group-hover:scale-110">
            <Play className="fill-white text-white w-6 h-6 ml-1" />
          </div>

          {/* Caption Overlay */}
          {video.caption && (
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm font-medium">{video.caption}</p>
            </div>
          )}
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={video.caption || "Business Video"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
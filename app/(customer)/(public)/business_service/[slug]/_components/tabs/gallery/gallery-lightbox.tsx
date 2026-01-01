// app/business_service/[slug]/_components/gallery/gallery-lightbox.tsx

"use client";

import { useEffect, useCallback, useState } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Play,
  Pause,
  Maximize2,
  Calendar,
  User,
} from "lucide-react";
import Image from "next/image";
import { useGalleryState, useGalleryActions } from "@/store/customer/business_service/business-detail-store";
import { formatDate } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";

interface GalleryLightboxProps {
  images: any[];
  business: BusinessDetail;
}

export function GalleryLightbox({ images, business }: GalleryLightboxProps) {
  const { isOpen, currentIndex } = useGalleryState();
  const {
    setGalleryOpen,
    nextGalleryImage,
    prevGalleryImage,
    setGalleryIndex,
  } = useGalleryActions();
  const { setShareModalOpen } = useBusinessDetailStore();

  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentImage = images[currentIndex];
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) {
        nextGalleryImage();
        setZoom(1);
      } else if (e.key === "ArrowLeft" && hasPrev) {
        prevGalleryImage();
        setZoom(1);
      } else if (e.key === "Escape") {
        setGalleryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasNext, hasPrev, nextGalleryImage, prevGalleryImage, setGalleryOpen]);

  // Slideshow
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      if (hasNext) {
        nextGalleryImage();
        setZoom(1);
      } else {
        setGalleryIndex(0);
        setZoom(1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, hasNext, nextGalleryImage, setGalleryIndex]);

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
  }, [currentIndex]);

  // Close lightbox handler
  const handleClose = useCallback(() => {
    setGalleryOpen(false);
    setZoom(1);
    setIsPlaying(false);
  }, [setGalleryOpen]);

  // Handle next/prev
  const handleNext = useCallback(() => {
    if (hasNext) {
      nextGalleryImage();
    }
  }, [hasNext, nextGalleryImage]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      prevGalleryImage();
    }
  }, [hasPrev, prevGalleryImage]);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1));

  // Download image
  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${business.name}-photo-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Toggle fullscreen
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogTitle>
            {currentImage.caption || `Photo ${currentIndex + 1} of ${images.length}`}
          </DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-full flex flex-col">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Image Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-lg truncate">
                  {currentImage.caption || `Photo ${currentIndex + 1} of ${images.length}`}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(currentImage.createdAt)}</span>
                  </div>
                  {currentImage.type && (
                    <Badge
                      variant={currentImage.type === "business" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {currentImage.type === "business" ? "Business" : "Customer"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setGalleryOpen(false);
                    setShareModalOpen(true);
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center p-16 overflow-hidden">
            <div
              className="relative transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom})`,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.altText || currentImage.caption || "Gallery image"}
                width={currentImage.width || 1200}
                height={currentImage.height || 800}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {hasPrev && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setGalleryIndex(idx)}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                    idx === currentIndex
                      ? "ring-2 ring-primary scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="text-center mt-2">
              <span className="text-white text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

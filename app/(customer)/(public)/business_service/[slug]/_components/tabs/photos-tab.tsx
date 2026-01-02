// app/business_service/[slug]/_components/tabs/photos-tab.tsx

"use client";

import { useMemo, useState } from "react";
import { BusinessDetail, GalleryFilter, GalleryImage } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Filter,
  Grid3x3,
  List,
  Download,
  Share2,
  Calendar,
  User,
  Video,
  Play,
} from "lucide-react";
import Image from "next/image";
import { convertToGalleryImages, formatDate } from "@/lib/utils/business-detail-utils";
import { useGalleryState, useGalleryActions } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./gallery/gallery-lightbox";

import { VideoPreviewGrid } from "@/components/business/video-preview-grid";

interface PhotosTabProps {
  business: BusinessDetail;
}

export function PhotosTab({ business }: PhotosTabProps) {
  const { filter } = useGalleryState();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { setGalleryOpen, setGalleryIndex, setGalleryFilter } = useGalleryActions();

  // Helper to set filter locally (global store)
  const setFilter = (v: GalleryFilter) => setGalleryFilter(v);

  // Convert all images to gallery format
  const allImages = useMemo(
    () => convertToGalleryImages(business.images || [], business.photos || []),
    [business.images, business.photos]
  );

  // Filter images
  const filteredImages = useMemo(() => {
    switch (filter) {
      case "business":
        return allImages.filter((img) => img.type === "business");
      case "user":
        return allImages.filter((img) => img.type === "user");
      case "video":
        return allImages.filter((img) => img.type === "video");
      case "interior":
        return allImages.filter((img) => img.caption?.toLowerCase().includes("interior"));
      case "exterior":
        return allImages.filter((img) => img.caption?.toLowerCase().includes("exterior"));
      case "menu":
        return allImages.filter((img) => img.caption?.toLowerCase().includes("menu"));
      case "all":
      default:
        return allImages;
    }
  }, [allImages, filter]);

  // Stats
  const stats = useMemo(() => {
    const businessCount = allImages.filter((img) => img.type === "business").length;
    const userCount = allImages.filter((img) => img.type === "user").length;
    const videoCount = allImages.filter((img) => img.type === "video").length;

    return { total: allImages.length, business: businessCount, user: userCount, video: videoCount };
  }, [allImages]);

  const handleImageClick = (index: number) => {
    setGalleryFilter(filter);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  if (allImages.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Photos Available</h3>
        <p className="text-muted-foreground">
          Photos haven&apos;t been uploaded yet.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header & Controls */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                Photo Gallery
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredImages.length} {filteredImages.length === 1 ? "photo" : "photos"}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter & Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filter Dropdown */}
            <Select value={filter} onValueChange={(v) => setFilter(v as GalleryFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter photos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Photos ({stats.total})</SelectItem>
                <SelectItem value="video">Videos ({stats.video})</SelectItem>
                <SelectItem value="business">By Business ({stats.business})</SelectItem>
                <SelectItem value="user">By Customers ({stats.user})</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="exterior">Exterior</SelectItem>
                <SelectItem value="menu">Menu</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 border-primary/20 bg-primary/5 text-primary">
                <Video className="h-3 w-3" />
                {stats.video} Videos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ImageIcon className="h-3 w-3" />
                {stats.business} Business
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {stats.user} Customer
              </Badge>
            </div>
          </div>
        </Card>

        {/* Gallery Display */}
        {filteredImages.length === 0 ? (
          <Card className="p-12 text-center">
            <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Photos in This Category</h3>
            <p className="text-muted-foreground">
              Try selecting a different filter.
            </p>
          </Card>
        ) : filter === "video" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <VideoPreviewGrid
               videos={business.photos.filter(p => p.type === "VIDEO")}
               hideTitle
             />
          </div>
        ) : viewMode === "grid" ? (
          <GalleryGrid images={filteredImages} onImageClick={handleImageClick} />
        ) : (
          <GalleryList images={filteredImages} onImageClick={handleImageClick} />
        )}
      </div>

      {/* Lightbox Modal */}
      <GalleryLightbox images={filteredImages} business={business} />
    </>
  );
}

// Gallery Grid View
function GalleryGrid({
  images,
  onImageClick,
}: {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-muted"
          onClick={() => onImageClick(index)}
        >
          <Image
            src={image.thumbnailUrl || image.url}
            alt={image.altText || image.caption || `Photo ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Video Play Overlay */}
          {image.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 text-white fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full">
              {image.caption && (
                <p className="text-white text-sm font-medium line-clamp-2">
                  {image.caption}
                </p>
              )}
            </div>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={image.type === "video" ? "default" : image.type === "business" ? "default" : "secondary"}
              className={cn(
                "text-xs shadow-md",
                image.type === "video" && "bg-primary hover:bg-primary"
              )}
            >
              {image.type === "video" ? "Video" : image.type === "business" ? "Business" : "Customer"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Gallery List View
function GalleryList({
  images,
  onImageClick,
}: {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {images.map((image, index) => (
        <Card
          key={image.id}
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => onImageClick(index)}
        >
          <div className="grid grid-cols-[200px_1fr] gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={image.thumbnailUrl || image.url}
                alt={image.altText || image.caption || `Photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="200px"
              />
              {image.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-10 w-10 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between py-2">
              <div className="space-y-2">
                {image.caption && (
                  <h4 className="font-semibold text-lg line-clamp-2">
                    {image.caption}
                  </h4>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={image.type === "video" ? "default" : image.type === "business" ? "default" : "secondary"}
                    className={cn(image.type === "video" && "bg-primary hover:bg-primary")}
                  >
                    {image.type === "video" ? "Business Video" : image.type === "business" ? "Business Photo" : "Customer Photo"}
                  </Badge>

                  {image.width && image.height && image.type !== "video" && (
                    <Badge variant="outline">
                      {image.width} × {image.height}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(image.createdAt)}</span>
                </div>

                <Button variant="ghost" size="sm" className="gap-2">
                  {image.type === "video" ? "Watch Video" : "View Full Size"}
                  {image.type === "video" ? <Play className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

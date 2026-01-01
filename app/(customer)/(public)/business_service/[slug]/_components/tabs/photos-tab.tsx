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
} from "lucide-react";
import Image from "next/image";
import { convertToGalleryImages, formatDate } from "@/lib/utils/business-detail-utils";
import { useGalleryActions } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { GalleryLightbox } from "./gallery/gallery-lightbox";

interface PhotosTabProps {
  business: BusinessDetail;
}

export function PhotosTab({ business }: PhotosTabProps) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { setGalleryOpen, setGalleryIndex, setGalleryFilter } = useGalleryActions();

  // Convert all images to gallery format
  const allImages = useMemo(
    () => convertToGalleryImages(business.images, business.photos),
    [business.images, business.photos]
  );

  // Filter images
  const filteredImages = useMemo(() => {
    switch (filter) {
      case "business":
        return allImages.filter((img) => img.type === "business");
      case "user":
        return allImages.filter((img) => img.type === "user");
      case "interior":
        // Would need category/tag data on images
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
    const business = allImages.filter((img) => img.type === "business").length;
    const user = allImages.filter((img) => img.type === "user").length;

    return { total: allImages.length, business, user };
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
                <SelectItem value="business">By Business ({stats.business})</SelectItem>
                <SelectItem value="user">By Customers ({stats.user})</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="exterior">Exterior</SelectItem>
                <SelectItem value="menu">Menu</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-2">
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
            src={image.url}
            alt={image.altText || image.caption || `Photo ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

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
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant={image.type === "business" ? "default" : "secondary"} className="text-xs">
              {image.type === "business" ? "Business" : "Customer"}
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
                src={image.url}
                alt={image.altText || image.caption || `Photo ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="200px"
              />
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
                  <Badge variant={image.type === "business" ? "default" : "secondary"}>
                    {image.type === "business" ? "Business Photo" : "Customer Photo"}
                  </Badge>

                  {image.width && image.height && (
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
                  View Full Size
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

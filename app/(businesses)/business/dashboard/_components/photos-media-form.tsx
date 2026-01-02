// app/business/dashboard/_components/photos-media-form.tsx
"use client";

import { useState } from "react";
import { Business, BusinessImage, Photo } from "@prisma/client";
import { ImageUpload } from "./image-upload";
import { VideoGalleryForm } from "./video-gallery-form";
import { CLOUDINARY_FOLDERS } from "@/lib/utils/cloudinary-client.utils";
import {
  useUpdateLogo,
  useUpdateCover,
  useAddGalleryImage,
  useDeleteGalleryImage,
  useReorderGallery,
} from "@/hooks/business-dashboard/use-business-images";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Plus, Image as ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PhotosMediaFormProps {
  business: Business & {
    images: BusinessImage[];
    photos: Photo[];
  };
}

export function PhotosMediaForm({ business }: PhotosMediaFormProps) {
  const [galleryImages, setGalleryImages] = useState(business.images || []);
  const [isDragging, setIsDragging] = useState(false);

  const logoMutation = useUpdateLogo(business.id);
  const coverMutation = useUpdateCover(business.id);
  const addImageMutation = useAddGalleryImage(business.id);
  const deleteImageMutation = useDeleteGalleryImage(business.id);
  const reorderMutation = useReorderGallery(business.id);

  const handleLogoUpload = (url: string, publicId: string) => {
    logoMutation.mutate({ logoUrl: url, publicId });
  };

  const handleCoverUpload = (url: string, publicId: string) => {
    coverMutation.mutate({ coverUrl: url, publicId });
  };

  const handleGalleryUpload = (url: string, publicId: string) => {
    addImageMutation.mutate({ imageUrl: url, publicId });
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(imageId);
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setIsDragging(false);

    const dragIndex = parseInt(e.dataTransfer.getData("text/html"));
    if (dragIndex === dropIndex) return;

    const newImages = [...galleryImages];
    const [removed] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, removed);

    // Update display order
    const reordered = newImages.map((img, index) => ({
      ...img,
      displayOrder: index,
    }));

    setGalleryImages(reordered);

    // Save new order to backend
    reorderMutation.mutate(
      reordered.map((img) => ({ id: img.id, order: img.displayOrder }))
    );
  };

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Logo Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Business Logo</h3>
          <p className="text-sm text-muted-foreground">
            Upload your business logo. Recommended: Square image (500x500px)
          </p>
        </div>

        <ImageUpload
          value={business.logo || undefined}
          onChange={handleLogoUpload}
          folder={CLOUDINARY_FOLDERS.BUSINESS_LOGOS}
          aspectRatio="square"
          maxSize={5}
          disabled={logoMutation.isPending}
          description="PNG or JPG. Best if square aspect ratio."
        />
      </div>

      {/* Cover Image Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Cover Image</h3>
          <p className="text-sm text-muted-foreground">
            Upload a cover image for your business page. Recommended: 1200x400px
          </p>
        </div>

        <ImageUpload
          value={business.coverImage || undefined}
          onChange={handleCoverUpload}
          folder={CLOUDINARY_FOLDERS.BUSINESS_COVERS}
          aspectRatio="video"
          maxSize={5}
          disabled={coverMutation.isPending}
          description="PNG or JPG. Landscape orientation works best."
        />
      </div>

      {/* Gallery Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Photo Gallery</h3>
          <p className="text-sm text-muted-foreground">
            Add photos of your business, products, or services. Drag to reorder.
          </p>
        </div>

        {/* Gallery Grid */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {galleryImages
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover"
                  />

                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 p-1 bg-black/50 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded backdrop-blur-sm text-white text-xs font-medium">
                    #{index + 1}
                  </div>

                  {/* Delete Button */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
          </div>
        )}

        {/* Add More Images */}
        <div>
          <ImageUpload
            onChange={handleGalleryUpload}
            folder={CLOUDINARY_FOLDERS.BUSINESS_GALLERY}
            maxSize={5}
            disabled={addImageMutation.isPending}
            label="Add More Photos"
            description="Upload photos to showcase your business"
          />
        </div>

        {/* Empty State */}
        {galleryImages.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No photos yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Start by uploading some photos of your business
            </p>
          </div>
        )}

        {/* Info */}
        {galleryImages.length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Drag and drop images to reorder them. The
              first image will be featured on your business page.
            </p>
          </div>
        )}
      </div>

      <Separator className="my-10" />

      {/* Video Gallery Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Business Videos
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your YouTube video gallery and virtual tours.
          </p>
        </div>

        <VideoGalleryForm
          businessId={business.id}
          initialVideos={business.photos}
        />
      </div>
    </div>
  );
}

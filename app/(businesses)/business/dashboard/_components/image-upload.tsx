// components/shared/image-upload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  uploadToCloudinary,
  validateImageFile,
  formatFileSize,
  createImagePreview,
  UploadProgress,
} from "@/lib/utils/cloudinary-client.utils";
import { ImageCropper } from "@/components/shared/image-cropper";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  maxSize?: number;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder,
  className,
  aspectRatio = "auto",
  maxSize = 5,
  disabled,
  label,
  description,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  };

  const handleUpload = useCallback(
    async (file: File | Blob) => {
      try {
        setUploading(true);
        setProgress(0);

        // If it's a File, validate it
        if (file instanceof File) {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            alert(validation.error);
            return;
          }
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file,
          folder,
          (progressData: UploadProgress) => {
            setProgress(progressData.percentage);
          }
        );

        // Update with actual URL
        setPreview(result.secure_url);
        onChange(result.secure_url, result.public_id);
      } catch (error) {
        console.error("Upload error:", error);
        alert(error instanceof Error ? error.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, onChange]
  );

  const onFileSelect = useCallback(
    async (file: File) => {
      if (aspectRatio !== "auto") {
        const previewUrl = await createImagePreview(file);
        setCroppingImage(previewUrl);
      } else {
        handleUpload(file);
      }
    },
    [aspectRatio, handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [disabled, uploading, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onRemove?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          aspectRatioClasses[aspectRatio]
        )}
      >
        {preview ? (
          // Image Preview
          <div className="relative w-full h-full min-h-[200px]">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />

            {!disabled && !uploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                <p className="text-white text-sm font-medium">{progress}%</p>
              </div>
            )}
          </div>
        ) : (
          // Upload Area
          <div
            className={cn(
              "flex flex-col items-center justify-center p-6 min-h-[200px] cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && !uploading && inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {progress}%
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP (max {maxSize}MB)
                </p>
              </>
            )}
          </div>
        )}

        <input
          title="image input"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {croppingImage && (
        <ImageCropper
          image={croppingImage}
          open={!!croppingImage}
          aspectRatio={aspectRatio === "square" ? 1 : 16 / 9}
          onClose={() => setCroppingImage(null)}
          onCropComplete={(croppedBlob) => {
            handleUpload(croppedBlob);
            setCroppingImage(null);
          }}
        />
      )}
    </div>
  );
}

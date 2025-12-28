// components/business-onboarding/steps/step7-photos.tsx
// Step 7: Business photos and media upload (Fixed)

"use client";

import React, { useState, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  AlertCircle,
  Info,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  photosSchema,
  type PhotosFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  usePhotos,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import {
  uploadToCloudinary,
  validateFile,
  type UploadProgress,
} from "@/lib/utils/cloudinary.utils";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormSection } from "../form-fields";

interface PhotoUploadState {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  url?: string;
  preview?: string;
}

export function Step7Photos() {
  const photos = usePhotos();
  const updatePhotos = useBusinessOnboardingStore(
    (state) => state.updatePhotos
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const previousStep = useBusinessOnboardingStore(
    (state) => state.previousStep
  );
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [logoUrl, setLogoUrl] = useState<string>(photos.logoUrl || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    photos.coverImageUrl || ""
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(photos.photoUrls || []);
  const [uploadStates, setUploadStates] = useState<
    Map<string, PhotoUploadState>
  >(new Map());
  const [uploadError, setUploadError] = useState<string>("");

  const form = useForm<PhotosFormData>({
    resolver: zodResolver(photosSchema),
    mode: "onChange",
    defaultValues: {
      logoUrl: photos.logoUrl || "",
      coverImageUrl: photos.coverImageUrl || "",
      photoUrls: photos.photoUrls || [],
    },
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = form;

  const handleImageUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      type: "logo" | "cover" | "gallery"
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError("");

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        return;
      }

      const uploadId = `${type}-${Date.now()}`;

      // Create preview
      const preview = URL.createObjectURL(file);

      // Initialize upload state
      setUploadStates((prev) =>
        new Map(prev).set(uploadId, {
          file,
          progress: 0,
          status: "uploading",
          preview,
        })
      );

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file,
          (progress: UploadProgress) => {
            setUploadStates((prev) => {
              const newMap = new Map(prev);
              const state = newMap.get(uploadId);
              if (state) {
                newMap.set(uploadId, {
                  ...state,
                  progress: progress.percentage,
                });
              }
              return newMap;
            });
          }
        );

        console.log("[Photo Upload] Success:", result);

        // Update upload state to success
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(uploadId, {
            file,
            progress: 100,
            status: "success",
            url: result.secure_url,
            preview,
          });
          return newMap;
        });

        // Update respective state based on type
        if (type === "logo") {
          setLogoUrl(result.secure_url);
          setValue("logoUrl", result.secure_url);
        } else if (type === "cover") {
          setCoverImageUrl(result.secure_url);
          setValue("coverImageUrl", result.secure_url);
        } else if (type === "gallery") {
          const updatedPhotos = [...photoUrls, result.secure_url];
          setPhotoUrls(updatedPhotos);
          setValue("photoUrls", updatedPhotos);
        }

        // Update store
        updatePhotos({
          logoUrl: type === "logo" ? result.secure_url : logoUrl,
          coverImageUrl: type === "cover" ? result.secure_url : coverImageUrl,
          photoUrls:
            type === "gallery" ? [...photoUrls, result.secure_url] : photoUrls,
        });

        // Clear upload state after 2 seconds
        setTimeout(() => {
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(uploadId);
            return newMap;
          });
          URL.revokeObjectURL(preview);
        }, 2000);
      } catch (error) {
        console.error("[Photo Upload] Error:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);

        setUploadStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(uploadId, {
            file,
            progress: 0,
            status: "error",
            error: errorMessage,
            preview,
          });
          return newMap;
        });

        URL.revokeObjectURL(preview);
      }

      // Reset input
      event.target.value = "";
    },
    [logoUrl, coverImageUrl, photoUrls, setValue, updatePhotos]
  );

  const removePhoto = (index: number) => {
    const updatedPhotos = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updatedPhotos);
    setValue("photoUrls", updatedPhotos);
    updatePhotos({ photoUrls: updatedPhotos });
  };

  const onSubmit: SubmitHandler<PhotosFormData> = async (data) => {
    try {
      console.log("[Step 7] Photos data:", data);

      updatePhotos(data);
      markStepComplete(7);
      nextStep();
    } catch (error) {
      console.error("[Step 7] Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Photos & Media"
        description="Add photos to showcase your business and attract customers"
        step={7}
      >
        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Tip:</strong> High-quality photos increase customer
            engagement by up to 60%. Upload clear, well-lit images. Recommended:
            Logo (square), Cover (landscape), Gallery (min 3 photos).
          </AlertDescription>
        </Alert>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Logo Upload */}
        <FormSection title="Business Logo">
          {errors.logoUrl && (
            <p className="text-sm text-destructive mb-2">
              {errors.logoUrl.message}
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {logoUrl ? (
              <div className="relative w-32 h-32 rounded-lg border-2 border-primary overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setLogoUrl("");
                      setValue("logoUrl", "");
                      updatePhotos({ logoUrl: "" });
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "logo")}
                  className="hidden"
                />
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center">
                  Upload Logo
                </span>
              </label>
            )}

            <div className="flex-1">
              <p className="text-sm text-foreground font-medium mb-2">
                Logo Guidelines
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Square format recommended (1:1 ratio)</li>
                <li>• Minimum 200x200px, ideal 512x512px</li>
                <li>• Clear background preferred</li>
                <li>• JPG, PNG, or WEBP format</li>
              </ul>

              {/* Upload Progress for Logo */}
              {Array.from(uploadStates.entries()).map(([id, state]) => {
                if (!id.startsWith("logo")) return null;
                return (
                  <div key={id} className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">
                        {state.file.name}
                      </span>
                      {state.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {state.status === "success" && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    {state.status === "uploading" && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${state.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Cover Image Upload */}
        <FormSection title="Cover Image">
          <div className="space-y-4">
            {coverImageUrl ? (
              <div className="relative w-full h-64 rounded-lg border-2 border-primary overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setCoverImageUrl("");
                      setValue("coverImageUrl", "");
                      updatePhotos({ coverImageUrl: "" });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Cover
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cover-upload"
                className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "cover")}
                  className="hidden"
                />
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
                <span className="text-sm font-medium text-foreground mb-1">
                  Upload Cover Image
                </span>
                <span className="text-xs text-muted-foreground">
                  Landscape format • 1200x400px recommended
                </span>
              </label>
            )}

            {/* Upload Progress for Cover */}
            {Array.from(uploadStates.entries()).map(([id, state]) => {
              if (!id.startsWith("cover")) return null;
              return (
                <div key={id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">
                      {state.file.name}
                    </span>
                    {state.status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {state.status === "success" && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {state.status === "uploading" && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>

        {/* Gallery Upload */}
        <FormSection title="Photo Gallery">
          {errors.photoUrls && (
            <p className="text-sm text-destructive mb-2">
              {errors.photoUrls.message}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing Photos */}
            {photoUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-border group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePhoto(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {index === 0 && (
                  <Badge className="absolute bottom-2 left-2 bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            ))}

            {/* Upload Button */}
            {photoUrls.length < 20 && (
              <label
                htmlFor="gallery-upload"
                className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "gallery")}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Add Photo
                </span>
              </label>
            )}
          </div>

          {/* Upload Progress for Gallery */}
          {Array.from(uploadStates.entries()).map(([id, state]) => {
            if (!id.startsWith("gallery")) return null;
            return (
              <div key={id} className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {state.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={state.preview}
                      alt="Preview"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">
                        {state.file.name}
                      </span>
                      {state.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {state.status === "success" && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    {state.status === "uploading" && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${state.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground mt-4">
            {photoUrls.length}/20 photos uploaded • First photo will be featured
          </p>
        </FormSection>
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        onBack={previousStep}
      />
    </form>
  );
}

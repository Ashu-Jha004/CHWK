// components/business-onboarding/steps/step7-photos.tsx
// Step 7: Business photos and media upload with premium orange gallery UI

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
  Star,
  Camera,
  Layers,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "File validation failed");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const uploadId = `${type}-${Date.now()}`;
      const preview = URL.createObjectURL(file);
      const toastId = toast.loading(`Uploading ${type}...`);

      setUploadStates((prev) =>
        new Map(prev).set(uploadId, {
          file,
          progress: 0,
          status: "uploading",
          preview,
        })
      );

      try {
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

        updatePhotos({
          logoUrl: type === "logo" ? result.secure_url : logoUrl,
          coverImageUrl: type === "cover" ? result.secure_url : coverImageUrl,
          photoUrls:
            type === "gallery" ? [...photoUrls, result.secure_url] : photoUrls,
        });

        toast.success(`${type} updated successfully!`, { id: toastId });

        setTimeout(() => {
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(uploadId);
            return newMap;
          });
          URL.revokeObjectURL(preview);
        }, 2000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMessage, { id: toastId });

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
      event.target.value = "";
    },
    [logoUrl, coverImageUrl, photoUrls, setValue, updatePhotos]
  );

  const removePhoto = (index: number) => {
    const updatedPhotos = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updatedPhotos);
    setValue("photoUrls", updatedPhotos);
    updatePhotos({ photoUrls: updatedPhotos });
    toast.info("Gallery photo removed");
  };

  const onSubmit: SubmitHandler<PhotosFormData> = async (data) => {
    try {
      updatePhotos(data);
      markStepComplete(7);
      toast.success("Visuals captured! Ready for final review.");
      nextStep();
    } catch (error) {
      toast.error("Failed to save photos.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Visual Identity"
        description="First impressions matter. Showcase your workspace, products, and brand logo."
        step={7}
      >
        {/* Photography Tip */}
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-100 rounded-3xl flex gap-4 items-start shadow-xl shadow-orange-500/5">
           <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
             <Camera className="w-6 h-6" />
           </div>
           <div>
             <h4 className="text-lg font-black text-orange-900 tracking-tight mb-1">Professional Touch</h4>
             <p className="text-sm text-orange-700/80 font-medium leading-relaxed">
               Businesses with high-quality photos receive 3x more customer inquiries.
               Use natural lighting and capture your storefront from the exterior.
             </p>
           </div>
        </div>

        {/* Logo Upload */}
        <FormSection title="Brand Signature">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/20 p-8 rounded-3xl border-2 border-dashed border-border/50">
            <div className="relative group">
               {logoUrl ? (
                <div className="w-40 h-40 rounded-3xl border-4 border-primary overflow-hidden shadow-2xl relative">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setLogoUrl("");
                        setValue("logoUrl", "");
                        updatePhotos({ logoUrl: "" });
                        toast.info("Logo removed");
                      }}
                      className="h-8 gap-1 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" />
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="logo-upload"
                  className="w-40 h-40 border-4 border-dashed border-border rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group shadow-inner"
                >
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    className="hidden"
                  />
                  <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                     <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-4 text-muted-foreground group-hover:text-primary">
                    Upload Logo
                  </span>
                </label>
              )}
              {/* Logo Progress Circle (if any) */}
              {Array.from(uploadStates.entries()).map(([id, state]) => {
                if (!id.startsWith("logo") || state.status !== "uploading") return null;
                return (
                  <div key={id} className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-3xl z-10">
                     <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                     <span className="text-xs font-black">{Math.round(state.progress)}%</span>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 space-y-4">
               <div>
                  <h4 className="font-black text-xl tracking-tight mb-1">Primary Logo</h4>
                  <p className="text-sm text-muted-foreground font-medium">This represents your business across search rankings and notifications.</p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100">
                    <Check className="w-3 h-3" /> Square Ratio
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100">
                    <Check className="w-3 h-3" /> Transparent PNG
                  </div>
               </div>
               {errors.logoUrl && <p className="text-xs font-bold text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.logoUrl.message}</p>}
            </div>
          </div>
        </FormSection>

        {/* Cover Image Upload */}
        <FormSection title="Hero Spotlight">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
               <div>
                 <h4 className="font-black text-xl tracking-tight">Cover Image</h4>
                 <p className="text-sm text-muted-foreground font-medium">The main splash image that appears at the top of your profile.</p>
               </div>
               {coverImageUrl && <Badge className="bg-primary shadow-lg shadow-primary/20 gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Active Spotlight</Badge>}
            </div>

            <div className="relative group">
              {coverImageUrl ? (
                <div className="w-full h-80 rounded-[2.5rem] border-4 border-primary overflow-hidden shadow-2xl">
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-8 translate-y-4 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-white">
                       <ImageIcon className="w-5 h-5" />
                       <span className="font-black text-sm uppercase tracking-widest">Spotlight Image</span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCoverImageUrl("");
                        setValue("coverImageUrl", "");
                        updatePhotos({ coverImageUrl: "" });
                        toast.info("Cover removed");
                      }}
                      className="rounded-xl h-10 px-6 font-black uppercase tracking-widest gap-2 bg-red-600/90 backdrop-blur-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="cover-upload"
                  className="w-full h-80 border-4 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden bg-muted/10"
                >
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cover")}
                    className="hidden"
                  />
                  <div className="p-6 bg-white rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                     <ImageIcon className="w-12 h-12 text-primary" />
                  </div>
                  <h5 className="mt-6 font-black text-foreground tracking-tight">Choose a Cinematic Banner</h5>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-2">1200 x 400px Recommended • Landscape</p>
                </label>
              )}

              {/* Cover Upload Progress Overlay */}
              {Array.from(uploadStates.entries()).map(([id, state]) => {
                if (!id.startsWith("cover") || state.status !== "uploading") return null;
                return (
                  <div key={id} className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center rounded-[2.5rem] z-20 backdrop-blur-sm">
                     <div className="w-full max-w-xs space-y-4 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                        <h4 className="font-black text-xl tracking-tight">Developing Imagery...</h4>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
                           <div className="h-full bg-primary transition-all duration-300" style={{ width: `${state.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{Math.round(state.progress)}% COMPLETED</span>
                     </div>
                  </div>
                );
              })}
            </div>
            {errors.coverImageUrl && <p className="text-xs font-bold text-destructive py-2 px-4 bg-red-50 rounded-xl border border-red-100 mt-2">{errors.coverImageUrl.message}</p>}
          </div>
        </FormSection>

        {/* Gallery Upload */}
        <FormSection title="Curated Gallery">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h4 className="font-black text-xl tracking-tight">Business Portfolio</h4>
               <p className="text-sm text-muted-foreground font-medium">Upload up to 20 high-resolution images of your storefront, interiors, and products.</p>
             </div>
             <Badge variant="outline" className="border-2 font-black text-[10px] px-3 py-1 uppercase tracking-widest">
               {photoUrls.length} / 20 SLOTS
             </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Existing Gallery Photos */}
            {photoUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl group animate-in zoom-in-90 duration-500"
              >
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                   <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removePhoto(index)}
                      className="h-10 w-10 rounded-xl shadow-lg border-2 border-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                </div>
                {index === 0 && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg border-none gap-1 py-1 px-2.5">
                    <Star className="w-3 h-3 fill-white" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Featured</span>
                  </Badge>
                )}
              </div>
            ))}

            {/* Gallery Upload Slot */}
            {photoUrls.length < 20 && (
              <label
                htmlFor="gallery-upload"
                className="aspect-square border-4 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-muted/5 shadow-inner p-4"
              >
                <input
                  id="gallery-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "gallery")}
                  className="hidden"
                />
                <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:rotate-12 transition-all duration-300">
                   <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4 group-hover:text-primary">
                  Append Media
                </span>
              </label>
            )}
          </div>

          {/* Active Gallery Progress */}
          {Array.from(uploadStates.entries()).map(([id, state]) => {
            if (!id.startsWith("gallery") || state.status !== "uploading") return null;
            return (
              <div key={id} className="mt-8 p-6 bg-white border-2 border-primary/10 rounded-3xl shadow-xl flex items-center gap-6 animate-in slide-in-from-left-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-4 border-white shrink-0">
                  <img src={state.preview} alt="Preview" className="w-full h-full object-cover blur-sm" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                     <h5 className="text-sm font-black uppercase tracking-widest text-foreground">Syncing to Cloud</h5>
                     <span className="text-xs font-black text-primary">{Math.round(state.progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: `${state.progress}%` }} />
                  </div>
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            );
          })}

          <div className="mt-8 flex items-center gap-3 py-4 px-6 bg-muted/30 rounded-2xl border-2 border-dashed border-border/50">
             <Layers className="w-5 h-5 text-muted-foreground" />
             <p className="text-xs font-bold text-muted-foreground">
               Currently utilizing <span className="text-foreground font-black">{photoUrls.length} positions</span> of your 20-image digital asset allowance.
             </p>
          </div>
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

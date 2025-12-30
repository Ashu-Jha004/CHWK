/* eslint-disable @typescript-eslint/no-explicit-any */
// components/business-dashboard/seo/seo-meta-dialog.tsx
"use client";

import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Globe, Loader2 } from "lucide-react";
import { KeywordsInput } from "./keywords-input";
import { useSEODialogStore } from "@/store/business-dashboard/use-seo-dialog-store";
import { useUpdateSEOMetadata } from "@/hooks/business-dashboard/use-seo-metadata";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  seoMetadataSchema,
  SEOMetadataFormData,
} from "@/lib/validations/business-dashboard/profile/seo-metadata";

interface SEOMetaDialogProps {
  businessId: string;
  businessName: string;
  initialData: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metadataKeywords: string[];
  };
}

export function SEOMetaDialog({
  businessId,
  businessName,
  initialData,
}: SEOMetaDialogProps) {
  const { isOpen, setIsOpen, tempKeywords, setTempKeywords } =
    useSEODialogStore();
  const { executeUpdate, isPending } = useUpdateSEOMetadata(businessId);

  // Fix: Explicitly type the useForm to avoid the Resolver mismatch
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(seoMetadataSchema),
    defaultValues: {
      metaTitle: initialData.metaTitle || "",
      metaDescription: initialData.metaDescription || "",
      metadataKeywords: initialData.metadataKeywords || [],
    },
  });

  const onSubmit = useCallback(
    (data: SEOMetadataFormData) => {
      try {
        executeUpdate({
          ...data,
          metadataKeywords: tempKeywords,
        });
        setIsOpen(false);
      } catch (err) {
        console.error("[SEO_DIALOG_SUBMIT_ERROR]:", err);
      }
    },
    [tempKeywords, executeUpdate, setIsOpen]
  );

  useEffect(() => {
    if (isOpen) {
      setTempKeywords(initialData.metadataKeywords || []);
    }
  }, [isOpen, initialData.metadataKeywords, setTempKeywords]);

  // Note: watch() is used here for the real-time Google Preview UI
  const watchedTitle = watch("metaTitle");
  const watchedDesc = watch("metaDescription");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Edit SEO Metadata
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Fix: Explicitly cast handleSubmit to satisfy the type-safe submission */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Search Engine Optimization</DialogTitle>
            <DialogDescription>
              Improve your visibility on Indian search engines. Optimize your
              title and tags.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Google Preview Visualizer */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-[12px] text-[#202124] mb-1">
                <div className="bg-slate-100 p-1 rounded-full">
                  <Globe className="h-3 w-3" />
                </div>
                <span className="truncate">
                  https://yourplatform.in › biz ›{" "}
                  {businessName.toLowerCase().replace(/\s+/g, "-")}
                </span>
              </div>
              <h3 className="text-xl text-[#1a0dab] font-normal hover:underline cursor-pointer truncate">
                {watchedTitle || businessName}
              </h3>
              <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                {watchedDesc ||
                  "Provide a meta description to see how your business appears in search results..."}
              </p>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">
                  SEO Title (Recommended 50-60 chars)
                </Label>
                <Input
                  id="metaTitle"
                  {...register("metaTitle")}
                  placeholder="e.g. Best Punjabi Restaurant in South Delhi | Name"
                />
                {errors.metaTitle && (
                  <p className="text-xs text-destructive">error!</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">
                  Meta Description (Recommended 150-160 chars)
                </Label>
                <Textarea
                  id="metaDescription"
                  {...register("metaDescription")}
                  className="resize-none h-24"
                  placeholder="Describe your specialties and location to attract clicks..."
                />
                {errors.metaDescription && (
                  <p className="text-xs text-destructive">error</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Search Keywords ({tempKeywords.length}/25)</Label>
                <KeywordsInput />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            {/* Optimized Tailwind class: min-w-25 as suggested */}
            <Button type="submit" disabled={isPending} className="min-w-25">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save SEO Settings"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

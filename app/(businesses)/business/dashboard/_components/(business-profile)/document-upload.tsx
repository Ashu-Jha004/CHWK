/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(businesses)/business/dashboard/_components/(business-profile)/legal/document-upload.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { DocumentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCcw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadBusinessDocument,
  deleteBusinessDocument,
} from "@/app/(businesses)/business/actions/business-legal";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DocumentUploadProps {
  businessId: string;
  type: DocumentType;
  label: string;
  customName?: string; // Support for custom titles like "College Degree"
  existingDoc?: {
    id: string;
    fileUrl: string;
    status: string;
  };
}

export const DocumentUpload = ({
  businessId,
  type,
  label,
  customName,
  existingDoc,
}: DocumentUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const statusStyles = useMemo(
    () => ({
      PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      VERIFIED: "bg-secondary/10 text-secondary border-secondary/20",
      REJECTED: "bg-red-500/10 text-red-600 border-red-200",
    }),
    []
  );

  const onUploadSuccess = useCallback(
    async (result: any) => {
      setIsProcessing(true);
      try {
        const { secure_url, public_id, format } = result.info;

        const response = await uploadBusinessDocument(businessId, {
          type,
          customName,
          fileUrl: secure_url,
          publicId: public_id,
          fileType: format,
        });

        if (response.success) {
          toast.success(`${customName || label} updated successfully.`);
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        toast.error(`Upload failed: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [businessId, type, label, customName]
  );

  const handleDelete = async () => {
    if (!existingDoc) return;

    const confirmDelete = confirm(
      `Are you sure you want to remove this ${label}?`
    );
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      const response = await deleteBusinessDocument(existingDoc.id);
      if (response.success) {
        toast.success("Document removed successfully.");
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass p-4 rounded-xl border border-border/50 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{customName || label}</p>
            <p className="text-xs text-muted-foreground">
              PDF or Image (Max 5MB)
            </p>
          </div>
        </div>

        {existingDoc && (
          <div
            className={cn(
              "px-2 py-1 rounded text-[10px] font-bold border",
              statusStyles[existingDoc.status as keyof typeof statusStyles]
            )}
          >
            {existingDoc.status}
          </div>
        )}
      </div>

      {existingDoc ? (
        <div className="space-y-3">
          <div className="relative group overflow-hidden rounded-lg border aspect-video bg-muted/30 flex items-center justify-center">
            <Image
              src={existingDoc.fileUrl}
              alt={label}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs"
                asChild
              >
                <a href={existingDoc.fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> View
                </a>
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={onUploadSuccess}
              options={{
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                maxFiles: 1,
                resourceType: "auto",
              }}
            >
              {({ open }: any) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-2"
                  onClick={() => open()}
                  disabled={isProcessing}
                >
                  <RefreshCcw
                    className={cn(
                      "h-3.5 w-3.5",
                      isProcessing && "animate-spin"
                    )}
                  />
                  Replace
                </Button>
              )}
            </CldUploadWidget>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 border-destructive/20 text-xs gap-2"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={onUploadSuccess}
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            maxFiles: 1,
            resourceType: "auto",
            clientAllowedFormats: ["pdf", "jpg", "png", "jpeg"],
          }}
        >
          {({ open }: any) => (
            <Button
              type="button"
              variant="outline"
              disabled={isProcessing}
              onClick={() => open()}
              className="w-full border-dashed border-2 h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs">Click to upload {label}</span>
                </>
              )}
            </Button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
};

// components/business-onboarding/steps/step6-documentation.tsx
// Step 6: Document upload with Cloudinary

"use client";

import React, { useState, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  FileText,
  X,
  Check,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  documentationSchema,
  type DocumentationFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useDocumentation,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import {
  uploadToCloudinary,
  validateFile,
  type UploadProgress,
} from "@/lib/utils/cloudinary.utils";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormSection } from "../form-fields";

interface UploadedDocument {
  type: string;
  url: string;
  fileName: string;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  url?: string;
}

const DOCUMENT_TYPES = [
  { value: "Aadhaar Card", label: "Aadhaar Card", required: true },
  { value: "PAN Card", label: "PAN Card", required: false },
  { value: "GST Certificate", label: "GST Certificate", required: false },
  { value: "Business License", label: "Business License", required: false },
  { value: "Trade License", label: "Trade License", required: false },
  {
    value: "FSSAI License",
    label: "FSSAI License (Food businesses)",
    required: false,
  },
  { value: "Other", label: "Other Document", required: false },
];

export function Step6Documentation() {
  const documentation = useDocumentation();
  const updateDocumentation = useBusinessOnboardingStore(
    (state) => state.updateDocumentation
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [documents, setDocuments] = useState<UploadedDocument[]>(
    documentation.documents || []
  );
  const [uploadStates, setUploadStates] = useState<
    Map<string, FileUploadState>
  >(new Map());
  const [uploadError, setUploadError] = useState<string>("");

  const form = useForm<DocumentationFormData>({
    resolver: zodResolver(documentationSchema),
    mode: "onChange",
    defaultValues: {
      gstNumber: documentation.gstNumber || "",
      panNumber: documentation.panNumber || "",
      documents: documentation.documents || [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = form;

  const handleFileSelect = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      documentType: string
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

      const uploadId = `${documentType}-${Date.now()}`;

      // Initialize upload state
      setUploadStates((prev) =>
        new Map(prev).set(uploadId, {
          file,
          progress: 0,
          status: "uploading",
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

        console.log("[Upload] Success:", result);

        // Update upload state to success
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(uploadId, {
            file,
            progress: 100,
            status: "success",
            url: result.secure_url,
          });
          return newMap;
        });

        // Add to documents list
        const newDocument: UploadedDocument = {
          type: documentType,
          url: result.secure_url,
          fileName: file.name,
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        setValue("documents", updatedDocuments);

        // Update store
        updateDocumentation({ documents: updatedDocuments });

        // Clear upload state after 2 seconds
        setTimeout(() => {
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(uploadId);
            return newMap;
          });
        }, 2000);
      } catch (error) {
        console.error("[Upload] Error:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);

        // Update upload state to error
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(uploadId, {
            file,
            progress: 0,
            status: "error",
            error: errorMessage,
          });
          return newMap;
        });
      }

      // Reset input
      event.target.value = "";
    },
    [documents, setValue, updateDocumentation]
  );

  const removeDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    setValue("documents", updatedDocuments);
    updateDocumentation({ documents: updatedDocuments });
  };

  const onSubmit: SubmitHandler<DocumentationFormData> = async (data) => {
    try {
      console.log("[Step 6] Documentation data:", data);

      updateDocumentation(data);
      markStepComplete(6);
      nextStep();
    } catch (error) {
      console.error("[Step 6] Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Documentation"
        description="Upload required documents to verify your business"
        step={6}
      >
        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Required:</strong> At least one identity document
            (Aadhaar/PAN/License). Upload clear, readable documents. Max file
            size: 10MB per file.
          </AlertDescription>
        </Alert>

        {/* GST & PAN */}
        <FormSection title="Tax Information (Optional)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="GST Number"
              error={errors.gstNumber?.message}
              hint="15-digit GSTIN (optional)"
            >
              <Input
                {...register("gstNumber")}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="uppercase"
              />
            </FormField>

            <FormField
              label="PAN Number"
              error={errors.panNumber?.message}
              hint="10-character PAN (optional)"
            >
              <Input
                {...register("panNumber")}
                placeholder="AAAAA0000A"
                maxLength={10}
                className="uppercase"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Document Uploads */}
        <FormSection title="Upload Documents">
          {errors.documents && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.documents.message}</AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {DOCUMENT_TYPES.map((docType) => (
              <div key={docType.value} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">
                        {docType.label}
                        {docType.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP, or PDF • Max 10MB
                      </p>
                    </div>
                  </div>

                  <label htmlFor={`upload-${docType.value}`}>
                    <input
                      id={`upload-${docType.value}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      onChange={(e) => handleFileSelect(e, docType.value)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document
                          .getElementById(`upload-${docType.value}`)
                          ?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </label>
                </div>

                {/* Upload Progress */}
                {Array.from(uploadStates.entries()).map(([id, state]) => {
                  if (!id.startsWith(docType.value)) return null;

                  return (
                    <div key={id} className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate flex-1">
                          {state.file.name}
                        </span>
                        {state.status === "uploading" && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {state.status === "success" && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        {state.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>

                      {state.status === "uploading" && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${state.progress}%` }}
                          />
                        </div>
                      )}

                      {state.status === "error" && state.error && (
                        <p className="text-xs text-destructive mt-1">
                          {state.error}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Uploaded Documents */}
                {documents
                  .filter((doc) => doc.type === docType.value)
                  .map((doc, index) => (
                    <div
                      key={index}
                      className="mt-2 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-sm font-medium text-green-800 truncate">
                          {doc.fileName}
                        </span>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          Uploaded
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(documents.indexOf(doc))}
                        className="shrink-0 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* Summary */}
          {documents.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
            </div>
          )}
        </FormSection>
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!isValid}
      />
    </form>
  );
}

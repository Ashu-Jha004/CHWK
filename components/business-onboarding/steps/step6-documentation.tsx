// components/business-onboarding/steps/step6-documentation.tsx
// Step 6: Document upload with premium orange theme and Cloudinary integration

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
  ShieldCheck,
  FileCheck,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file selected");
        return;
      }

      const uploadId = `${documentType}-${Date.now()}`;
      const uploadToast = toast.loading(`Uploading ${documentType}...`);

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
        toast.success(`${documentType} uploaded!`, { id: uploadToast });

        // Clear upload state after 2 seconds
        setTimeout(() => {
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(uploadId);
            return newMap;
          });
        }, 2000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMessage, { id: uploadToast });

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
    const docToRemove = documents[index];
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    setValue("documents", updatedDocuments);
    updateDocumentation({ documents: updatedDocuments });
    toast.info(`${docToRemove.type} removed`);
  };

  const onSubmit: SubmitHandler<DocumentationFormData> = async (data) => {
    try {
      updateDocumentation(data);
      markStepComplete(6);
      toast.success("Documents verified! Almost there.");
      nextStep();
    } catch (error) {
       console.error("[Step 6] Error:", error);
       toast.error("Failed to save documentation.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Verification & Trust"
        description="Securely upload your business credentials to unlock merchant features."
        step={6}
      >
        {/* Compliance Guard Alert */}
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-3xl flex gap-4 items-start shadow-xl shadow-indigo-500/5">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
             <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
             <h4 className="text-lg font-black text-indigo-900 tracking-tight mb-1">KYC Compliance</h4>
             <p className="text-sm text-indigo-700/80 font-medium leading-relaxed">
               For security, we require at least one government ID. All documents are stored using
               enterprise-grade encryption and only used for verification purposes.
             </p>
           </div>
        </div>

        {/* GST & PAN */}
        <FormSection title="Tax Identifiers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="GST Number"
              error={errors.gstNumber?.message}
              hint="15-digit GSTIN (optional but recommended)"
            >
              <div className="relative group">
                <Input
                  {...register("gstNumber")}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-black uppercase tracking-wider"
                />
              </div>
            </FormField>

            <FormField
              label="PAN Number"
              error={errors.panNumber?.message}
              hint="10-character business or personal PAN"
            >
              <div className="relative group">
                <Input
                  {...register("panNumber")}
                  placeholder="AAAAA0000A"
                  maxLength={10}
                  className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-black uppercase tracking-wider"
                />
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Document Uploads */}
        <FormSection title="Verifiable Credentials">
          {errors.documents && (
            <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-bold text-destructive">{errors.documents.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {DOCUMENT_TYPES.map((docType) => {
              const uploadedDocs = documents.filter((doc) => doc.type === docType.value);
              const isUploaded = uploadedDocs.length > 0;

              return (
                <div
                  key={docType.value}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all duration-300",
                    isUploaded
                      ? "bg-emerald-50 border-emerald-100 shadow-md shadow-emerald-500/5"
                      : "bg-background border-border hover:border-primary/20 hover:bg-muted/10"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                        isUploaded ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {isUploaded ? <FileCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
                          {docType.label}
                          {docType.required && !isUploaded && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[8px] uppercase tracking-tighter">Required</Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">
                          Accepts PDF, JPG, PNG • Up to 10MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label htmlFor={`upload-${docType.value}`} className="cursor-pointer">
                        <input
                          id={`upload-${docType.value}`}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                          onChange={(e) => handleFileSelect(e, docType.value)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant={isUploaded ? "outline" : "default"}
                          size="lg"
                          onClick={() =>
                            document
                              .getElementById(`upload-${docType.value}`)
                              ?.click()
                          }
                          className={cn(
                            "rounded-2xl h-12 px-6 font-bold transition-all",
                            !isUploaded && "bg-gradient-to-r from-primary to-orange-600 shadow-lg shadow-primary/20"
                          )}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploaded ? "Replace" : "Upload Document"}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Upload Progress Individual */}
                  {Array.from(uploadStates.entries()).map(([id, state]) => {
                    if (!id.startsWith(docType.value)) return null;

                    return (
                      <div key={id} className="mt-4 p-4 bg-muted/50 rounded-2xl border-2 border-dashed border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold truncate max-w-[200px]">
                            {state.file.name}
                          </span>
                          {state.status === "uploading" && (
                            <div className="flex items-center gap-2">
                               <Loader2 className="w-4 h-4 animate-spin text-primary" />
                               <span className="text-[10px] font-black">{Math.round(state.progress)}%</span>
                            </div>
                          )}
                        </div>
                        {state.status === "uploading" && (
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300"
                              style={{ width: `${state.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Uploaded List For This Type */}
                  {uploadedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="mt-4 flex items-center justify-between p-4 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                           <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-black text-emerald-950 truncate">
                          {doc.fileName}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(documents.indexOf(doc))}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Verification Progress Badge */}
          {documents.length > 0 && (
            <div className="mt-8 p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-center gap-2">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <span className="text-xs font-black uppercase tracking-widest text-primary">
                 {documents.length} of {DOCUMENT_TYPES.length} document hooks established
               </span>
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

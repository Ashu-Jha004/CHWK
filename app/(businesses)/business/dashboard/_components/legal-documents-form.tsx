"use client";

import { Business, BusinessDocument } from "@prisma/client";
import { DocumentUpload } from "./(business-profile)/document-upload"; // Fixed import path
import { AddCustomDocument } from "./dd-custom-document";
import { ShieldCheck, GraduationCap, File, Plus } from "lucide-react";

interface LegalDocumentsFormProps {
  business: Business & {
    documents: BusinessDocument[];
  };
}

export const LegalDocumentsForm = ({ business }: LegalDocumentsFormProps) => {
  // Helper to find specific mandatory/pre-defined docs
  const getDoc = (type: string) =>
    business.documents.find((d) => d.type === type);

  // Filter out documents that are categorized as "OTHER" (Custom Docs)
  const customDocs = business.documents.filter((d) => d.type === "OTHER");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Trust & Verification Header */}
      <div className="glass p-6 rounded-xl border-l-4 border-l-primary flex gap-4">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
        <div>
          <h3 className="text-lg font-bold">Trust & Verification</h3>
          <p className="text-sm text-muted-foreground">
            Verify your business to unlock premium features and build trust with
            customers. Mandatory for Indian businesses: PAN, GST, and Aadhaar.
          </p>
        </div>
      </div>

      {/* 2. Mandatory Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocumentUpload
          businessId={business.id}
          type="PAN_CARD"
          label="PAN Card"
          existingDoc={getDoc("PAN_CARD")}
        />
        <DocumentUpload
          businessId={business.id}
          type="GST_CERTIFICATE"
          label="GST Certificate"
          existingDoc={getDoc("GST_CERTIFICATE")}
        />
        <DocumentUpload
          businessId={business.id}
          type="AADHAAR_CARD"
          label="Aadhaar Card"
          existingDoc={getDoc("AADHAAR_CARD")}
        />
      </div>

      {/* 3. Pre-defined Optional Certifications */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          Business Specific Licenses
          <span className="text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DocumentUpload
            businessId={business.id}
            type="FSSAI_LICENSE"
            label="FSSAI License (Food)"
            existingDoc={getDoc("FSSAI_LICENSE")}
          />
          <DocumentUpload
            businessId={business.id}
            type="TRADE_LICENSE"
            label="Trade License"
            existingDoc={getDoc("TRADE_LICENSE")}
          />
        </div>
      </div>

      {/* 4. Custom Documents & Degrees Section */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold">
            Additional Degrees & Certificates
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dynamically render all custom documents uploaded by the user */}
          {customDocs.map((doc) => (
            <DocumentUpload
              key={doc.id}
              businessId={business.id}
              type="OTHER"
              label="Custom Document"
              customName={doc.customName || "Other Document"}
              existingDoc={doc}
            />
          ))}

          {/* The Add Button that opens the Shadcn Dialog */}
          <AddCustomDocument businessId={business.id} />
        </div>
      </div>
    </div>
  );
};

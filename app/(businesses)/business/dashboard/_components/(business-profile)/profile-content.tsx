// app/(businesses)/business/dashboard/_components/(business-profile)/profile-content.tsx
"use client";

import { useDashboardStore } from "@/store/business-dashboard";
import {
  Amenity,
  Business,
  BusinessAmenity,
  BusinessCategory,
  BusinessHours,
  BusinessImage,
  BusinessDocument, // 1. Added Import
  Category,
} from "@prisma/client";
import { BasicInfoForm } from "./basic-info-form";
import { BusinessHoursForm } from "../business-hours-form";
import { PhotosMediaForm } from "../photos-media-form";
import { ProfileTabs } from "./profile-tabs";
import { CategoriesAmenitiesForm } from "../categories-amenities-form";
import { ServiceSettingsForm } from "../service-settings/service-settings-form";
import { LegalDocumentsForm } from "../legal-documents-form"; // 2. Added Import

interface ProfileContentProps {
  business: Business & {
    images: BusinessImage[];
    documents: BusinessDocument[]; // 3. Added to Type Definition
    categories: (BusinessCategory & {
      category: Category;
    })[];
    amenities: (BusinessAmenity & {
      amenity: Amenity;
    })[];
  };

  businessHours: BusinessHours[];
}

export function ProfileContent({
  business,
  businessHours,
}: ProfileContentProps) {
  const { activeProfileTab } = useDashboardStore();

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="w-full max-w-full overflow-x-auto">
        <ProfileTabs />
      </div>

      <div className="w-full max-w-full animate-in fade-in duration-300">
        {activeProfileTab === "basic-info" && (
          <BasicInfoForm business={business} />
        )}

        {activeProfileTab === "hours" && (
          <BusinessHoursForm
            business={business}
            existingHours={businessHours}
          />
        )}

        {activeProfileTab === "photos" && (
          <PhotosMediaForm business={business} />
        )}

        {activeProfileTab === "categories" && (
          <CategoriesAmenitiesForm business={business} />
        )}

        {activeProfileTab === "service-settings" && (
          <ServiceSettingsForm businessId={business.id} />
        )}

        {/* ✅ UPDATED: Renders the Legal & Documents Tab */}
        {activeProfileTab === "legal" && (
          <LegalDocumentsForm business={business} />
        )}
      </div>
    </div>
  );
}

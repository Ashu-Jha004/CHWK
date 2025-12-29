// app/business/dashboard/_components/profile-content.tsx
"use client";

import { useDashboardStore } from "@/store/business-dashboard";
import { Business, BusinessHours, BusinessImage } from "@prisma/client";
import { BasicInfoForm } from "./basic-info-form";
import { BusinessHoursForm } from "../business-hours-form";
import { PhotosMediaForm } from "../photos-media-form";
import { ProfileTabs } from "./profile-tabs";

interface ProfileContentProps {
  business: Business & {
    images: BusinessImage[];
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
      {/* Profile Tabs */}
      <div className="w-full max-w-full overflow-x-auto">
        <ProfileTabs />
      </div>

      {/* Tab Content */}
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
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              Categories & Amenities
            </h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        )}

        {activeProfileTab === "service-settings" && (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              Service Settings
            </h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        )}

        {activeProfileTab === "legal" && (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              Legal & Documents
            </h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

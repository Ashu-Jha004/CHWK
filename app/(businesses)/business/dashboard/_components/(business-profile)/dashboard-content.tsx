// app/(businesses)/business/dashboard/_components/(business-profile)/dashboard-content.tsx
"use client";

import { useDashboardStore } from "@/store/business-dashboard";
import {
  Business,
  BusinessHours,
  BusinessImage,
  BusinessCategory,
  BusinessAmenity,
  BusinessDocument, // ✅ Added Import
  Category,
  Amenity,
} from "@prisma/client";
import { ProfileContent } from "./profile-content";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ReviewsManagementTab } from "../business-dashboard/reviews-management-tab";

interface DashboardContentProps {
  business: Business & {
    images: BusinessImage[];
    documents: BusinessDocument[]; // ✅ Added to Type Definition
    categories: (BusinessCategory & {
      category: Category;
    })[];
    amenities: (BusinessAmenity & {
      amenity: Amenity;
    })[];
  };
  businessHours: BusinessHours[];
}

export function DashboardContent({
  business,
  businessHours,
}: DashboardContentProps) {
  const { activeTab, triggerRefresh } = useDashboardStore();
  const router = useRouter();

  const handleRefresh = () => {
    triggerRefresh();
    router.refresh();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );

      case "profile":
        return (
          <ProfileContent business={business} businessHours={businessHours} />
        );

      case "reviews":
        return (
          <ReviewsManagementTab businessId={business.id} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

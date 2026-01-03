"use client";

import { useDashboardStore } from "@/store/business-dashboard";
import {
  Business,
  BusinessHours,
  BusinessImage,
  BusinessCategory,
  BusinessAmenity,
  BusinessDocument,
  Category,
  Amenity,
  Photo,
} from "@prisma/client";
import { ProfileContent } from "./profile-content";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ReviewsManagementTab } from "../business-dashboard/reviews-management-tab";
import { StaffManagementTab } from "../business-dashboard/staff-management-tab";
import { OverviewTab } from "../overview-tab";
import { ComplaintsManagementTab } from "../business-dashboard/complaints-management-tab";

interface DashboardContentProps {
  business: Business & {
    images: BusinessImage[];
    documents: BusinessDocument[];
    photos: Photo[];
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
        return <OverviewTab businessId={business.id} />;

      case "profile":
        return (
          <ProfileContent business={business} businessHours={businessHours} />
        );

      case "reviews":
        return (
          <ReviewsManagementTab businessId={business.id} />
        );

      case "complaints":
        return <ComplaintsManagementTab businessId={business.id} />;

      case "staff":
        return (
           <StaffManagementTab businessId={business.id} />
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

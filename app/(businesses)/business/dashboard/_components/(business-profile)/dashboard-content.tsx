// app/business/dashboard/_components/dashboard-content.tsx
"use client";

import { useDashboardStore } from "@/store/business-dashboard";
import { Business, BusinessHours, BusinessImage } from "@prisma/client";
import { ProfileContent } from "./profile-content";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  business: Business  & {
    images: BusinessImage[];
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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-2">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Analytics and insights coming soon...
            </p>
          </div>
        );

      case "profile":
        return (
          <ProfileContent business={business} businessHours={businessHours} />
        );

      case "reviews":
        return (
          <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-2">Reviews Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );

      case "staff":
        return (
          <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-2">Staff Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );

      case "complaints":
        return (
          <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-2">
              Complaints Management
            </h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Get page title based on active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Dashboard Overview";
      case "profile":
        return "Business Profile";
      case "reviews":
        return "Reviews Management";
      case "staff":
        return "Staff Management";
      case "complaints":
        return "Complaints Management";
      default:
        return "Dashboard";
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case "overview":
        return "Monitor your business performance";
      case "profile":
        return "Manage your business information";
      case "reviews":
        return "View and respond to customer reviews";
      case "staff":
        return "Manage your team and schedules";
      case "complaints":
        return "Handle customer complaints";
      default:
        return "";
    }
  };

  return (
    <div className="container-padding section-spacing">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

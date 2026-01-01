// app/business_service/[slug]/_components/business-page-client.tsx

"use client";

import { useEffect, useMemo } from "react";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { BusinessHeader } from "./business-header";
import { BusinessSidebar } from "./business-sidebar";
import { BusinessTabs } from "./business-tabs";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ShareModal } from "./modals/share-modal";
import { ReportModal } from "./modals/report-modal";
import { cn } from "@/lib/utils";
import { calculateBusinessStats } from "@/lib/utils/business-detail-utils";
import { useMediaQuery } from "@/hooks/customer/business_service/use-media-query";

interface BusinessPageClientProps {
  business: BusinessDetail;
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
}

export function BusinessPageClient({
  business,
  relatedBusinessesPromise,
}: BusinessPageClientProps) {
  const { setIsMobile } = useBusinessDetailStore();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Calculate business statistics
  const stats = useMemo(() => calculateBusinessStats(business), [business]);

  // Set mobile state
  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  // Generate visible tabs based on business data
  const visibleTabs = useMemo(() => {
    const tabs = [
      { id: "overview", visible: true },
      { id: "about", visible: true },
      {
        id: "products",
        visible: business.offersProducts && stats.totalProducts > 0,
      },
      {
        id: "services",
        visible: business.offersServices && stats.totalServices > 0,
      },
      { id: "staff", visible: stats.totalStaff > 0 },
      { id: "chain", visible: business.chainId !== null && business.chain !== null },
      { id: "photos", visible: stats.totalPhotos > 0 },
      { id: "reviews", visible: true }, // Always show (can write reviews)
      { id: "contact", visible: true },
    ];

    return tabs.filter((tab) => tab.visible);
  }, [business, stats]);

  return (
    <>
      {/* Business Header */}
      <BusinessHeader business={business} stats={stats} />

      {/* Main Content Area */}
      <div className="min-h-screen bg-muted/30">
        <div className="container-padding section-spacing-tight">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 relative">
            {/* Sidebar Navigation - Desktop */}
            <aside
              className={cn(
                "hidden lg:block",
                "sticky top-6 self-start",
                "h-fit max-h-[calc(100vh-8rem)] overflow-y-auto",
                "transition-all duration-300"
              )}
            >
              <BusinessSidebar
                business={business}
                stats={stats}
                visibleTabs={visibleTabs}
              />
            </aside>

            {/* Main Content */}
            <main className="min-w-0 pb-20 lg:pb-6">
              <BusinessTabs
                business={business}
                stats={stats}
                visibleTabs={visibleTabs}
                relatedBusinessesPromise={relatedBusinessesPromise}
              />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav business={business} stats={stats} />

      {/* Modals */}
      <ShareModal business={business} />
      <ReportModal business={business} />
    </>
  );
}

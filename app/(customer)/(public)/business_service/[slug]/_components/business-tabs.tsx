// app/business_service/[slug]/_components/business-tabs.tsx

"use client";

import { Suspense, useMemo } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Home,
  Info,
  ShoppingBag,
  Wrench,
  Users,
  MapPin,
  Image as ImageIcon,
  Star,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tab Components (we'll create these in next steps)
import { OverviewTab } from "./tabs/overview-tab";
import { AboutTab } from "./tabs/about-tab";
import { ProductsTab } from "./tabs/products-tab";
import { ServicesTab } from "./tabs/services-tab";
import { StaffTab } from "./tabs/staff-tab";
import { ChainTab } from "./tabs/chain-tab";
import { PhotosTab } from "./tabs/photos-tab";
import { ReviewsTab } from "./tabs/reviews-tab";
import { ContactTab } from "./tabs/contact-tab";
import { ErrorFallback } from "./error-fallback";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessTabsProps {
  business: BusinessDetail;
  stats: BusinessStats;
  visibleTabs: Array<{ id: string; visible: boolean }>;
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
}

const TAB_ICONS: Record<string, any> = {
  overview: Home,
  about: Info,
  products: ShoppingBag,
  services: Wrench,
  staff: Users,
  chain: MapPin,
  photos: ImageIcon,
  reviews: Star,
  contact: Phone,
};

const TAB_LABELS: Record<string, string> = {
  overview: "Overview",
  about: "About",
  products: "Products",
  services: "Services",
  staff: "Staff",
  chain: "Locations",
  photos: "Photos",
  reviews: "Reviews",
  contact: "Contact",
};

export function BusinessTabs({
  business,
  stats,
  visibleTabs,
  relatedBusinessesPromise,
}: BusinessTabsProps) {
  const { activeTab, setActiveTab, isMobile } = useBusinessDetailStore();

  // Ensure active tab is valid
  const validActiveTab = useMemo(() => {
    const isValid = visibleTabs.some((tab) => tab.id === activeTab);
    return isValid ? activeTab : visibleTabs[0]?.id || "overview";
  }, [activeTab, visibleTabs]);

  return (
    <div id="business-content" className="scroll-mt-6">
      <Tabs
        value={validActiveTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        {/* Mobile Tab Selector */}
        {isMobile && (
          <Card className="mb-4 p-1 overflow-x-auto hide-scrollbar sticky top-0 z-10 bg-card/95 backdrop-blur-lg">
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent">
              {visibleTabs.map((tab) => {
                const Icon = TAB_ICONS[tab.id];
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex-shrink-0 gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{TAB_LABELS[tab.id]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Card>
        )}

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
              <ErrorBoundaryWrapper>
                <OverviewTab
                  business={business}
                  stats={stats}
                  relatedBusinessesPromise={relatedBusinessesPromise}
                />
              </ErrorBoundaryWrapper>
            </Suspense>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
              <ErrorBoundaryWrapper>
                <AboutTab business={business} stats={stats} />
              </ErrorBoundaryWrapper>
            </Suspense>
          </TabsContent>

          {/* Products Tab */}
          {stats.totalProducts > 0 && (
            <TabsContent value="products" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                <ErrorBoundaryWrapper>
                  <ProductsTab business={business} />
                </ErrorBoundaryWrapper>
              </Suspense>
            </TabsContent>
          )}

          {/* Services Tab */}
          {stats.totalServices > 0 && (
            <TabsContent value="services" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                <ErrorBoundaryWrapper>
                  <ServicesTab business={business} />
                </ErrorBoundaryWrapper>
              </Suspense>
            </TabsContent>
          )}

          {/* Staff Tab */}
          {stats.totalStaff > 0 && (
            <TabsContent value="staff" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                <ErrorBoundaryWrapper>
                  <StaffTab business={business} />
                </ErrorBoundaryWrapper>
              </Suspense>
            </TabsContent>
          )}

          {/* Chain/Locations Tab */}
          {business.chain && (
            <TabsContent value="chain" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                <ErrorBoundaryWrapper>
                  <ChainTab business={business} />
                </ErrorBoundaryWrapper>
              </Suspense>
            </TabsContent>
          )}

          {/* Photos Tab */}
          <TabsContent value="photos" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
              <ErrorBoundaryWrapper>
                <PhotosTab business={business} />
              </ErrorBoundaryWrapper>
            </Suspense>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
              <ErrorBoundaryWrapper>
                <ReviewsTab business={business} stats={stats} />
              </ErrorBoundaryWrapper>
            </Suspense>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
              <ErrorBoundaryWrapper>
                <ContactTab business={business} />
              </ErrorBoundaryWrapper>
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Error Boundary Wrapper Component
function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  // Note: Functional components cannot act as Error Boundaries with try/catch.
  // Proper error boundaries must be class components.
  // We rely on page-level error.tsx or parent boundaries for now.
  return <>{children}</>;
}

// Tab Content Loading Skeleton
function TabContentSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-32 w-full mt-6" />
    </Card>
  );
}

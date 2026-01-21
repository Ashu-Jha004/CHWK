// app/business_service/[slug]/_components/business-tabs.tsx

"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { BusinessDetail, BusinessStats, TabId } from "@/types/customer/business/business-detail";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Lazy-loaded Tab Components
const OverviewTab = dynamic(() => import("./tabs/overview-tab").then(mod => ({ default: mod.OverviewTab })), {
  loading: () => <TabContentSkeleton />,
});

const AboutTab = dynamic(() => import("./tabs/about-tab").then(mod => ({ default: mod.AboutTab })), {
  loading: () => <TabContentSkeleton />,
});

const ActionTab = dynamic(() => import("./ActionTab").then(mod => ({ default: mod.default })), {
  loading: () => <TabContentSkeleton />,
});
const WebsiteTab = dynamic(() => import("./Websitetab").then(mod => ({ default: mod.default })), {
  loading: () => <TabContentSkeleton />,
});
const ProductsTab = dynamic(() => import("./tabs/products-tab").then(mod => ({ default: mod.ProductsTab })), {
  loading: () => <TabContentSkeleton />,
});

const ServicesTab = dynamic(() => import("./tabs/services-tab").then(mod => ({ default: mod.ServicesTab })), {
  loading: () => <TabContentSkeleton />,
});

const StaffTab = dynamic(() => import("./tabs/staff-tab").then(mod => ({ default: mod.StaffTab })), {
  loading: () => <TabContentSkeleton />,
});

const ChainTab = dynamic(() => import("./tabs/chain-tab").then(mod => ({ default: mod.ChainTab })), {
  loading: () => <TabContentSkeleton />,
});

const PhotosTab = dynamic(() => import("./tabs/photos-tab").then(mod => ({ default: mod.PhotosTab })), {
  loading: () => <TabContentSkeleton />,
});

const ReviewsTab = dynamic(() => import("./tabs/reviews-tab").then(mod => ({ default: mod.ReviewsTab })), {
  loading: () => <TabContentSkeleton />,
});

const ContactTab = dynamic(() => import("./tabs/contact-tab").then(mod => ({ default: mod.ContactTab })), {
  loading: () => <TabContentSkeleton />,
});

import { Skeleton } from "@/components/ui/skeleton";

interface BusinessTabsProps {
  business: BusinessDetail;
  stats: BusinessStats;
  visibleTabs: Array<{ id: string; visible: boolean }>;
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
  onBookClick?: () => void;
  onOrderClick?: () => void;
}

export function BusinessTabs({
  business,
  stats,
  visibleTabs,
  relatedBusinessesPromise,
  onBookClick,
  onOrderClick,
}: BusinessTabsProps) {
  const { activeTab, setActiveTab } = useBusinessDetailStore();

  const validActiveTab = useMemo(() => {
    const isValid = visibleTabs.some((tab) => tab.id === activeTab);
    return isValid ? activeTab : visibleTabs[0]?.id || "overview";
  }, [activeTab, visibleTabs]);

  return (
    <div id="business-content" className="scroll-mt-6">
      <Tabs
        value={validActiveTab}
        onValueChange={(value) => setActiveTab(value as TabId)}
        className="w-full"
      >
        <div className="space-y-6">
          <TabsContent value="overview" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <OverviewTab
                  business={business}
                  stats={stats}
                  relatedBusinessesPromise={relatedBusinessesPromise}
                  onBookClick={onBookClick}
                  onOrderClick={onOrderClick}
                />
            </Suspense>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <AboutTab business={business} stats={stats} />
            </Suspense>
          </TabsContent>
          <TabsContent value="actions" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <ActionTab business={business} />
            </Suspense>
          </TabsContent>
          <TabsContent value="website" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <WebsiteTab business={business} />
            </Suspense>
          </TabsContent>

          {stats?.totalProducts > 0 && (
            <TabsContent value="products" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                  <ProductsTab
                    business={business}
                    onOrderClick={onOrderClick}
                  />
              </Suspense>
            </TabsContent>
          )}

          {stats?.totalServices > 0 && (
            <TabsContent value="services" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                  <ServicesTab
                    business={business}
                    onBookClick={onBookClick}
                  />
              </Suspense>
            </TabsContent>
          )}

          {stats?.totalStaff > 0 && (
            <TabsContent value="staff" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                  <StaffTab business={business} />
              </Suspense>
            </TabsContent>
          )}

          {business.chain && (
            <TabsContent value="chain" className="mt-0">
              <Suspense fallback={<TabContentSkeleton />}>
                  <ChainTab business={business} />
              </Suspense>
            </TabsContent>
          )}

          <TabsContent value="photos" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <PhotosTab business={business} />
            </Suspense>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <ReviewsTab
                  businessId={business.id}
                  businessName={business.name}
                  initialStats={{
                    averageRating: stats?.averageRating || 0,
                    totalReviews: stats?.totalReviews || 0,
                  }}
                />
            </Suspense>
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <Suspense fallback={<TabContentSkeleton />}>
                <ContactTab business={business} />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

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

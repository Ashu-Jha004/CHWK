// app/business_service/[slug]/_components/business-sidebar.tsx

"use client";

import { useMemo } from "react";
import { BusinessDetail, BusinessStats, TabId } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";

interface BusinessSidebarProps {
  business: BusinessDetail;
  stats: BusinessStats;
  visibleTabs: Array<{ id: string; visible: boolean }>;
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
  staff: "Our Staff",
  chain: "Locations",
  photos: "Photos",
  reviews: "Reviews",
  contact: "Contact",
};

export function BusinessSidebar({
  business,
  stats,
  visibleTabs,
}: BusinessSidebarProps) {
  const { activeTab, setActiveTab } = useBusinessDetailStore();

  // Calculate badges for tabs
  const tabBadges = useMemo(
    () => ({
      products: stats.totalProducts,
      services: stats.totalServices,
      staff: stats.totalStaff,
      photos: stats.totalPhotos,
      reviews: stats.totalReviews,
    }),
    [stats]
  );

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);

    // Smooth scroll to top of content area
    const mainContent = document.getElementById("business-content");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card className="p-2 sticky top-6">
      <nav className="space-y-1" aria-label="Business navigation">
        {visibleTabs.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;
          const badge = tabBadges[tab.id as keyof typeof tabBadges];

          return (
            <div key={tab.id}>
              {index === 6 && <Separator className="my-2" />}
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-2.5 px-3",
                  isActive && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => handleTabClick(tab.id as TabId)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">
                  {TAB_LABELS[tab.id]}
                </span>
                {badge && badge > 0 ? (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="ml-auto text-xs px-2 py-0 h-5"
                  >
                    {badge > 999 ? "999+" : badge}
                  </Badge>
                ) : null}
              </Button>
            </div>
          );
        })}
      </nav>

      {/* Quick Info Section */}
      <div className="mt-4 pt-4 border-t border-border space-y-3 px-2">
        <div className="space-y-2 text-sm">
          {stats.averageRating > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {stats.priceRange && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price Range</span>
              <span className="font-medium">
                {"₹".repeat(
                  ["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"].indexOf(
                    stats.priceRange
                  ) + 1
                )}
              </span>
            </div>
          )}

          {business.hasDelivery && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <Badge variant="secondary" className="text-xs">
                Available
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

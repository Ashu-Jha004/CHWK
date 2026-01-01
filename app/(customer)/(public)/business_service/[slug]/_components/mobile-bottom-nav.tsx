// app/business_service/[slug]/_components/mobile-bottom-nav.tsx

"use client";

import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MessageCircle,
  Navigation,
  Share2,
  Bookmark,
  MapPin,
} from "lucide-react";
import {
  generateCallURL,
  generateWhatsAppURL,
  generateGoogleMapsURL,
  formatShortAddress,
} from "@/lib/utils/business-detail-utils";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  business: BusinessDetail;
  stats: BusinessStats;
}

export function MobileBottomNav({ business, stats }: MobileBottomNavProps) {
  const { isMobile, isSaved, toggleSave, setShareModalOpen } =
    useBusinessDetailStore();

  const callUrl = generateCallURL(business.phone);
  const whatsappUrl = generateWhatsAppURL(business.phone, business.name);
  const mapsUrl = generateGoogleMapsURL({
    latitude: business.latitude,
    longitude: business.longitude,
    businessName: business.name,
    address: formatShortAddress(business),
  });

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl">
      <div className="grid grid-cols-5 gap-1 p-2">
        {/* Call Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-1 gap-1"
        >
          <a href={callUrl}>
            <Phone className="h-5 w-5" />
            <span className="text-xs">Call</span>
          </a>
        </Button>

        {/* WhatsApp Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-1 gap-1"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">WhatsApp</span>
          </a>
        </Button>

        {/* Directions Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-1 gap-1"
        >
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-5 w-5" />
            <span className="text-xs">Directions</span>
          </a>
        </Button>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-col h-auto py-2 px-1 gap-1",
            isSaved && "text-primary"
          )}
          onClick={toggleSave}
        >
          <Bookmark
            className={cn("h-5 w-5", isSaved && "fill-primary")}
          />
          <span className="text-xs">Save</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-2 px-1 gap-1"
          onClick={() => setShareModalOpen(true)}
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </div>
  );
}

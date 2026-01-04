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
  onBookClick?: () => void;
  onOrderClick?: () => void;
}

export function MobileBottomNav({ business, stats, onBookClick, onOrderClick }: MobileBottomNavProps) {
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

  const showActions =
    business.offersServices ||
    business.offersProducts ||
    stats.totalServices > 0 ||
    stats.totalProducts > 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl safe-area-inset-bottom">
      {/* Primary Actions Area */}
      {showActions && (
        <div className="flex gap-3 p-3 pb-2">
          { (business.offersServices || stats.totalServices > 0) && (
            <Button
              onClick={onBookClick}
              className="flex-1 h-12 font-bold text-base shadow-md active:scale-95 transition-transform"
              size="default"
            >
              Book Appointment
            </Button>
          )}
          { (business.offersProducts || stats.totalProducts > 0) && (
            <Button
              onClick={onOrderClick}
              variant="secondary"
              className="flex-1 h-12 font-bold text-base shadow-md active:scale-95 transition-transform"
              size="default"
            >
              Order Now
            </Button>
          )}
        </div>
      )}

      {/* Secondary Actions Area */}
      <div className="flex items-center justify-around px-2 py-1 pb-2">
        {/* Call */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-1 px-2 gap-0.5 text-muted-foreground hover:text-primary"
        >
          <a href={callUrl}>
            <Phone className="h-4 w-4" />
            <span className="text-[9px] font-medium">Call</span>
          </a>
        </Button>

        {/* WhatsApp */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-1 px-2 gap-0.5 text-muted-foreground hover:text-green-600"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-[9px] font-medium">Chat</span>
          </a>
        </Button>

        {/* Directions */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-1 px-2 gap-0.5 text-muted-foreground hover:text-blue-600"
        >
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4" />
            <span className="text-[9px] font-medium">Map</span>
          </a>
        </Button>

        {/* Save */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-col h-auto py-1 px-2 gap-0.5 transition-colors",
            isSaved ? "text-primary" : "text-muted-foreground"
          )}
          onClick={toggleSave}
        >
          <Bookmark
            className={cn("h-4 w-4", isSaved && "fill-primary")}
          />
          <span className="text-[9px] font-medium">{isSaved ? "Saved" : "Save"}</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-auto py-1 px-2 gap-0.5 text-muted-foreground hover:text-primary"
          onClick={() => setShareModalOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-[9px] font-medium">Share</span>
        </Button>
      </div>
    </div>
  );
}

// app/business_service/[slug]/_components/business-page-client.tsx

"use client";

// Removed duplicate import
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { BusinessHeader } from "./business-header";
import { BusinessSidebar } from "./business-sidebar";
import { BusinessTabs } from "./business-tabs";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ShareModal } from "./modals/share-modal";
import { ReportModal } from "./modals/report-modal";
import { FileComplaintModal } from "./modals/file-complaint-modal";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { CustomOrderModal } from "@/components/commerce/custom-order-modal";
import { cn } from "@/lib/utils";
import { calculateBusinessStats } from "@/lib/utils/business-detail-utils";
import { useMediaQuery } from "@/hooks/customer/business_service/use-media-query";
import { Header } from "@/components/LandingPage/layout/header";
import { useMemo, useEffect, useState } from "react";
import {
  Search,
  Share2,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const { user } = useUser();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

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
        visible: (business.offersProducts || stats.totalProducts > 0),
      },
      {
        id: "services",
        visible: (business.offersServices || stats.totalServices > 0),
      },
      { id: "staff", visible: stats?.totalStaff > 0 },
      { id: "chain", visible: business.chainId !== null && business.chain !== null },
      { id: "photos", visible: stats?.totalPhotos > 0 },
      { id: "reviews", visible: true }, // Always show (can write reviews)
      { id: "contact", visible: true },
    ];

    return tabs.filter((tab) => tab.visible);
  }, [business, stats]);

  return (

    <>
     <Header  />
      {/* Business Header */}
      <BusinessHeader business={business} stats={stats} />

      {/* Booking CTA (FLOATING OR IN HEADER - For now, let's put a simplified trigger here for testing, or assume Header has it)
          Actually, let's add a floating action button or modify the header in a separate step if needed.
          For now, I'll rely on the existing UI structure, but ensure the Wizard is mounted.
      */}

      {/* Main Content Area */}
      <div className="min-h-screen bg-muted/30 pb-12">
        <div className="max-w-7xl mx-auto container-padding section-spacing-tight">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 relative">
            {/* Sidebar Navigation - Desktop */}
            <aside
              className={cn(
                "lg:sticky lg:top-8 lg:self-start transition-all duration-300",
                "h-fit lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto hide-scrollbar"
              )}
            >
              <BusinessSidebar
                business={business}
                stats={stats}
                visibleTabs={visibleTabs}
              />
                {/* Primary Action Card in Sidebar - Conditional Rendering */}
                {(business.offersServices || business.offersProducts || stats.totalServices > 0 || stats.totalProducts > 0) && (
                  <Card className="mt-4 p-5 space-y-4 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 opacity-70">
                        Primary Actions
                      </h3>
                      <div className="space-y-3">
                        { (business.offersServices || stats.totalServices > 0) && (
                          <Button
                            onClick={() => setIsBookingOpen(true)}
                            className="w-full h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] group/btn overflow-hidden relative"
                            size="lg"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Book Appointment
                            </span>
                            <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          </Button>
                        )}
                        { (business.offersProducts || stats.totalProducts > 0) && (
                          <Button
                            onClick={() => setIsOrderOpen(true)}
                            className="w-full h-12 font-bold shadow-lg shadow-secondary/10 hover:shadow-secondary/20 transition-all duration-300 active:scale-[0.98] group/btn overflow-hidden relative"
                            variant="secondary"
                            size="lg"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              Order Now
                            </span>
                            <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-center font-medium uppercase tracking-tight pt-3">
                        Secure & Real-time Booking
                      </p>
                    </div>
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  </Card>
                )}
            </aside>

            {/* Main Content */}
            <main className="min-w-0 pb-20 lg:pb-0">
              <BusinessTabs
                business={business}
                stats={stats}
                visibleTabs={visibleTabs}
                relatedBusinessesPromise={relatedBusinessesPromise}
                onBookClick={() => setIsBookingOpen(true)}
                onOrderClick={() => setIsOrderOpen(true)}
              />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        business={business}
        stats={stats}
        onBookClick={() => setIsBookingOpen(true)}
        onOrderClick={() => setIsOrderOpen(true)}
      />

      {/* Modals */}
      <ShareModal business={business} />
      <ReportModal business={business} />
      <FileComplaintModal business={business} />

      {/* Booking Wizard */}
      {(business.acceptsBookings || stats.totalServices > 0) && (
        <BookingWizard
          business={business}
          services={business.menuItems || []}
          staff={business.staff || []}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
          user={user}
        />
      )}

      {/* Custom Order Modal */}
      {(business.offersProducts || stats.totalProducts > 0) && (
        <CustomOrderModal
          businessId={business.id}
          businessName={business.name}
          open={isOrderOpen}
          onOpenChange={setIsOrderOpen}
        />
      )}
    </>
  );
}

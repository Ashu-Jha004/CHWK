// app/business/dashboard/_components/sidebar.tsx
"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/business-dashboard";
import { useMobile } from "@/hooks/business-dashboard/use-mobile";
import { Button } from "@/components/ui/button";
import { SidebarHeader } from "./sidebar-header";
import { SidebarItem } from "./sidebar-item";
import { SidebarFooter } from "./sidebar-footer";
import { sidebarItems } from "./sidebar-config";

interface SidebarProps {
  businessName: string;
  businessLogo?: string | null;
  pendingReviews?: number;
  pendingComplaints?: number;
}

export function Sidebar({
  businessName,
  businessLogo,
  pendingReviews = 0,
  pendingComplaints = 0,
}: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, isMobile } = useDashboardStore();
  const mobile = useMobile();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  // Badge counts
  const badgeCounts = useMemo(
    () => ({
      reviews: pendingReviews,
      complaints: pendingComplaints,
    }),
    [pendingReviews, pendingComplaints]
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-background transition-all duration-300",
          // Desktop
          "lg:relative lg:z-auto",
          sidebarOpen ? "lg:w-72" : "lg:w-20",
          // Mobile
          isMobile && (sidebarOpen ? "w-72 translate-x-0" : "-translate-x-full")
        )}
      >
        {/* Header */}
        <SidebarHeader
          businessName={businessName}
          businessLogo={businessLogo}
        />

        {/* Close button - Mobile only */}
        {isMobile && sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 hide-scrollbar">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              {...item}
              badgeCount={badgeCounts[item.id as keyof typeof badgeCounts]}
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(false);
                }
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <SidebarFooter />
      </aside>
    </>
  );
}

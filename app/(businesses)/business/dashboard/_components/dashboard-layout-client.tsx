// app/business/dashboard/_components/dashboard-layout-client.tsx
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/business-dashboard";
import { useStoreHydration } from "@/hooks/business-dashboard/use-store-hydration";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  businessName: string;
  businessLogo?: string | null;
  pendingReviews?: number;
  pendingComplaints?: number;
}

export function DashboardLayoutClient({
  children,
  businessName,
  businessLogo,
  pendingReviews = 0,
  pendingComplaints = 0,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const { sidebarOpen, triggerRefresh } = useDashboardStore();
  const hydrated = useStoreHydration();

  const handleRefresh = useCallback(() => {
    triggerRefresh();
    router.refresh();
  }, [triggerRefresh, router]);

  // Prevent hydration mismatch by not rendering until store is hydrated
  if (!hydrated) {
    return null;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        businessName={businessName}
        businessLogo={businessLogo}
        pendingReviews={pendingReviews}
        pendingComplaints={pendingComplaints}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader
          businessName={businessName}
          businessLogo={businessLogo}
          onRefresh={handleRefresh}
        />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="h-full p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

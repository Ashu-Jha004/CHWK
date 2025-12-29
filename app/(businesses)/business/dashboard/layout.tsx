// app/business/dashboard/layout.tsx
import { Suspense } from "react";
import { DashboardAuthWrapper } from "./_components/dashboard-auth-wrapper";
import { DashboardLayoutClient } from "./_components/dashboard-layout-client";
import { getCurrentBusiness } from "@/lib/auth";
import { Loading } from "@/components/business-dashboard/shared/loading";
import { ErrorBoundary } from "@/components/business-dashboard/shared/error-boundary";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <DashboardAuthWrapper>
        <Suspense fallback={<Loading fullScreen text="Loading dashboard..." />}>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
      </DashboardAuthWrapper>
    </ErrorBoundary>
  );
}

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch business data server-side
  const result = await getCurrentBusiness();

  // This should never happen because DashboardAuthWrapper handles errors
  // But TypeScript needs this check
  if (!result.success || !result.business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Unable to load business data</p>
      </div>
    );
  }

  const { business, user } = result;

  // Calculate pending counts for badges
  const pendingReviews = 0; // TODO: Calculate from database
  const pendingComplaints = business._count?.complaints || 0;

  return (
    <DashboardLayoutClient
      businessName={business.name}
      businessLogo={business?.logo || "/logo.png"}
      pendingReviews={pendingReviews}
      pendingComplaints={pendingComplaints}
    >
      {children}
    </DashboardLayoutClient>
  );
}

// Metadata
export const metadata = {
  title: "Business Dashboard",
  description: "Manage your business profile, reviews, staff, and more",
};

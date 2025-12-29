// app/business/dashboard/_components/dashboard-auth-wrapper.tsx
import { getCurrentBusiness } from "@/lib/auth";
import { NoBusiness } from "./no-business";
import { BusinessSuspended } from "./business-suspended";
import { InvalidRole } from "./invalid-role";

interface DashboardAuthWrapperProps {
  children: React.ReactNode;
}

export async function DashboardAuthWrapper({
  children,
}: DashboardAuthWrapperProps) {
  const result = await getCurrentBusiness();

  // Handle different error cases
  if (!result.success) {
    switch (result.error) {
      case "INVALID_ROLE":
        return <InvalidRole message={result.message || "Invalid role"} />;

      case "NO_BUSINESS":
        return <NoBusiness />;

      case "BUSINESS_SUSPENDED":
        return (
          <BusinessSuspended
            business={result.business!}
            message={result.message || "Business suspended"}
          />
        );

      default:
        return (
          <InvalidRole
            message={result.message || "An error occurred. Please try again."}
          />
        );
    }
  }

  // Success - render dashboard
  return <>{children}</>;
}

// app/business/dashboard/page.tsx
import { getCurrentBusiness } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "./_components/(business-profile)/dashboard-content";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get current business ID
  const result = await getCurrentBusiness();

  if (!result.success || !result.business) {
    redirect("/business/onboarding");
  }

  // Fetch complete business data with relations
  const [business, businessHours] = await Promise.all([
    prisma.business.findUnique({
      where: { id: result.business.id },
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { displayOrder: "asc" },
        },
      },
    }),
    prisma.businessHours.findMany({
      where: { businessId: result.business.id },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  // If business not found (edge case)
  if (!business) {
    redirect("/business/onboarding");
  }

  return <DashboardContent business={business} businessHours={businessHours} />;
}

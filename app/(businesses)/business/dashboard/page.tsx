// app/(businesses)/business/dashboard/page.tsx
import { getCurrentBusiness } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Note: Changed to 'db' to match standard Next.js / Prisma practices
import { DashboardContent } from "./_components/(business-profile)/dashboard-content";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Get current business ID via auth session
  const result = await getCurrentBusiness();

  if (!result.success || !result.business) {
    redirect("/business/onboarding");
  }

  // 2. Fetch complete business data with all relations (including the NEW documents relation)
  const [business, businessHours] = await Promise.all([
    prisma.business.findUnique({
      where: { id: result.business.id },
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { displayOrder: "asc" },
        },
        // ✅ NEW: Include business documents for the Legal Tab
        documents: {
          orderBy: { createdAt: "desc" },
        },
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        photos: {
          where: {
            type: "VIDEO",
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    prisma.businessHours.findMany({
      where: { businessId: result.business.id },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  // 3. Handle edge case where auth exists but DB record is missing
  if (!business) {
    redirect("/business/onboarding");
  }

  // 4. Render the Client-Side Dashboard Controller
  return <DashboardContent business={business} businessHours={businessHours} />;
}

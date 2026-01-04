import { getCurrentBusiness } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookingsClient } from "./_components/bookings-client";

export const metadata = {
  title: "Bookings | Business Dashboard",
  description: "Manage your business appointments and bookings",
};

export default async function BookingsPage() {
  const { business } = await getCurrentBusiness();

  if (!business) {
    redirect("/business/dashboard"); // Or error page
  }

  // Pass business ID to client component to fetch data
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      </div>

      <BookingsClient businessId={business.id} />
    </div>
  );
}

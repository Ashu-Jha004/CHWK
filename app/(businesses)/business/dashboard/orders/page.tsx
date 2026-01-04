import { getCurrentBusiness } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersClient } from "./_components/orders-client";

export const metadata = {
  title: "Orders | Business Dashboard",
  description: "Manage your customer orders",
};

export default async function OrdersPage() {
  const { business } = await getCurrentBusiness();

  if (!business) {
    redirect("/business/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <OrdersClient businessId={business.id} />
    </div>
  );
}

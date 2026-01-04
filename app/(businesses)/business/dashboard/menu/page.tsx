import { getCurrentBusiness } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MenuClient } from "./_components/menu-client";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Menu & Services | Business Dashboard",
  description: "Manage your services, products, and upload images",
};

export default async function MenuPage() {
  const { business } = await getCurrentBusiness();

  if (!business) {
    redirect("/business/dashboard");
  }

  // Fetch menu items server-side
  const menuItems = await prisma.menuItem.findMany({
    where: {
        businessId: business.id,
        deletedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu & Services</h1>
          <p className="text-muted-foreground">Manage your offerings and upload photos.</p>
        </div>
        {/* <Button>Add Item</Button> (Future) */}
      </div>

      <MenuClient initialItems={menuItems} businessId={business.id} />
    </div>
  );
}

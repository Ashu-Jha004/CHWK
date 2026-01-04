"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  MapPin,
  Search,
  Calendar,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  specialInstructions: string | null;
  business: {
    name: true,
    logo: string | null;
    slug: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PREPARING: "bg-blue-100 text-blue-700 border-blue-200",
  READY: "bg-green-100 text-green-700 border-green-200",
  DELIVERED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function MyOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json() as Promise<{ orders: any[] }>;
    },
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
          My <span className="text-primary italic">Orders</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Track and manage your recent orders and service requests.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or business..."
            className="pl-10 h-10 border-primary/10 bg-white/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : filteredOrders.length === 0 ? (
          <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center bg-muted/5">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <ShoppingBag className="h-10 w-10 text-primary/40" />
            </div>
            <CardTitle className="text-xl">No orders found</CardTitle>
            <CardDescription className="max-w-xs mx-auto mt-2">
              You haven't placed any orders yet. Explore businesses to start shopping!
            </CardDescription>
            <Link href="/search" className="mt-6">
              <Button className="font-bold uppercase tracking-widest px-8">
                Start Exploring
              </Button>
            </Link>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md bg-white">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                  {/* Business Image/Logo */}
                  <div className="h-16 w-16 rounded-xl bg-muted/20 flex items-center justify-center border border-primary/5 overflow-hidden shrink-0">
                    {order.business.logo ? (
                      <img src={order.business.logo} alt={order.business.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-primary/20" />
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">
                          {order.business.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                          </span>
                          <span className="text-primary/40 font-bold uppercase tracking-widest flex items-center gap-1 group/btn">
                             {order.orderNumber}
                          </span>
                        </div>
                      </div>
                      <Badge className={cn("px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none shadow-none", statusColors[order.status] || "bg-gray-100")}>
                        {order.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium line-clamp-1 italic">
                      "{order.specialInstructions || "No additional instructions"}"
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 md:pb-0 md:pr-6 flex items-center gap-3">
                  <Link href={`/business_service/${order.business.slug}`} className="w-full md:w-auto">
                    <Button variant="outline" size="sm" className="w-full md:w-auto font-black text-[10px] uppercase tracking-widest gap-2 bg-primary/5 border-primary/10 hover:bg-primary hover:text-white transition-all">
                      View Business
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

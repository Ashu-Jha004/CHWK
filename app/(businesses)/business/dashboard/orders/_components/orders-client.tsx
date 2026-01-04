"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Loader2,
    ShoppingCart,
    Clock,
    User,
    Phone,
    Mail,
    MoreVertical,
    CheckCircle2,
    XCircle,
    PackageCheck,
    Edit,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { OrderDetailModal } from "./order-detail-modal";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    specialInstructions: string | null;
    businessNotes: string | null;
    createdAt: string;
    total: number;
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
    };
}

interface OrdersClientProps {
  businessId: string;
}

export function OrdersClient({ businessId }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/business/${businessId}/orders?status=${activeTab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders(data.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [businessId, activeTab]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
      try {
          const res = await fetch(`/api/business/${businessId}/orders/${orderId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error("Failed to update status");

          toast.success(`Order marked as ${newStatus.toLowerCase()}`);
          fetchOrders(); // Refresh list
      } catch (error) {
          toast.error("Status update failed");
      }
  };

  const deleteOrder = async (orderId: string) => {
      if (!confirm("Are you sure you want to remove this order record? This action cannot be undone.")) return;

      try {
          const res = await fetch(`/api/business/${businessId}/orders/${orderId}`, {
              method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete order");

          toast.success("Order record removed");
          fetchOrders(); // Refresh list
      } catch (error) {
          toast.error("Deletion failed");
      }
  };

  return (
    <Tabs defaultValue="ALL" onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
            <TabsTrigger value="ALL">All Orders</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
            <TabsTrigger value="DELIVERED">Completed</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      <TabsContent value={activeTab} className="space-y-4">
        {loading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : orders.length === 0 ? (
           <div className="text-center py-12 border rounded-lg bg-muted/20">
             <p className="text-muted-foreground">No orders found.</p>
           </div>
        ) : (
           <div className="grid gap-4">
              {orders.map((order) => (
                 <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={(status) => updateOrderStatus(order.id, status)}
                    onEdit={() => setSelectedOrder(order)}
                    onDelete={() => deleteOrder(order.id)}
                />
              ))}
           </div>
        )}
      </TabsContent>

      {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            businessId={businessId}
            open={!!selectedOrder}
            onOpenChange={(open) => !open && setSelectedOrder(null)}
            onUpdate={fetchOrders}
          />
      )}
    </Tabs>
  );
}

function OrderCard({ order, onStatusUpdate, onEdit, onDelete }: {
    order: Order;
    onStatusUpdate: (status: string) => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        CONFIRMED: "bg-green-100 text-green-800 border-green-200",
        PREPARING: "bg-orange-100 text-orange-800 border-orange-200",
        READY_FOR_PICKUP: "bg-blue-100 text-blue-800 border-blue-200",
        DELIVERED: "bg-gray-100 text-gray-800 border-gray-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 flex flex-row items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">
                            {order.orderNumber}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("px-2 py-0.5", statusColors[order.status])}>
                        {order.status}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === "PENDING" && (
                                <DropdownMenuItem onClick={() => onStatusUpdate("CONFIRMED")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                    Accept Order
                                </DropdownMenuItem>
                            )}
                            {order.status === "CONFIRMED" && (
                                <DropdownMenuItem onClick={() => onStatusUpdate("READY_FOR_PICKUP")}>
                                    <PackageCheck className="h-4 w-4 mr-2 text-blue-600" />
                                    Mark Ready
                                </DropdownMenuItem>
                            )}
                            {(order.status === "READY_FOR_PICKUP" || order.status === "CONFIRMED") && (
                                <DropdownMenuItem onClick={() => onStatusUpdate("DELIVERED")}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                    Mark Delivered
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                <DropdownMenuItem onClick={() => onStatusUpdate("CANCELLED")} className="text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Order
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-destructive font-bold">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Record
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground underline decoration-primary/30 underline-offset-4">
                            Customer Details
                        </h4>
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <a href={`tel:${order.customerPhone}`} className="hover:text-primary transition-colors">
                                    {order.customerPhone}
                                </a>
                            </div>
                            {order.customerEmail && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{order.customerEmail}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Request */}
                    <div className="space-y-2 flex flex-col">
                         <h4 className="text-xs font-semibold uppercase text-muted-foreground underline decoration-primary/30 underline-offset-4">
                            Order Request
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-md border border-dashed border-muted-foreground/20 mt-1 flex-1 min-h-[60px]">
                            <p className="text-sm whitespace-pre-wrap italic">
                                "{order.specialInstructions || "No instructions provided."}"
                            </p>
                        </div>
                        {order.businessNotes && (
                            <div className="mt-2 text-xs bg-yellow-50 p-2 rounded border border-yellow-100">
                                <span className="font-bold text-yellow-800">Note: </span>
                                {order.businessNotes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Stats */}
                <div className="pt-4 border-t flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Order placed by authenticated user: <span className="font-medium">{order.user.email}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {order.total > 0 ? (
                            <div className="text-sm font-bold text-primary">
                                Total: ₹{order.total}
                            </div>
                        ) : (
                            <div className="flex flex-col items-end">
                                <Button variant="link" size="sm" onClick={onEdit} className="h-auto p-0 text-xs text-orange-600">
                                    Set Pricing
                                </Button>
                                <div className="text-[10px] text-muted-foreground italic">Pricing Pending</div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

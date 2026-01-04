"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface CustomOrderModalProps {
  businessId: string;
  businessName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomOrderModal({ businessId, businessName, open, onOpenChange }: CustomOrderModalProps) {
  const { user } = useUser();
  const [orderText, setOrderText] = useState("");
  const [phone, setPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderText.trim()) {
        toast.error("Please describe your order");
        return;
    }
    if (!phone) {
        toast.error("Phone number is required");
        return;
    }

    setIsSubmitting(true);
    try {
        const payload = {
            businessId,
            orderText,
            customerName: user?.fullName || "Guest",
            customerPhone: phone,
            customerEmail: user?.primaryEmailAddress?.emailAddress,
        };

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to place order");

        toast.success("Order placed successfully! The business will contact you.");
        onOpenChange(false);
        setOrderText("");
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order from {businessName}</DialogTitle>
          <DialogDescription>
            Type what you need below. The business will review your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>What and how much would you like to order?</Label>
                <Textarea
                    placeholder="Describe items and quantities (e.g. 3 Burgers, 2 Coffees...)"
                    value={orderText}
                    onChange={(e) => setOrderText(e.target.value)}
                    className="min-h-[120px]"
                />
            </div>

            <div className="space-y-2">
                <Label>Your Phone Number</Label>
                <Input
                    placeholder="+91..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !orderText.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

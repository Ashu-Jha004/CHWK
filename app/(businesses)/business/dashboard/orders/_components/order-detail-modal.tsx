"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OrderDetailModalProps {
    order: any;
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function OrderDetailModal({ order, businessId, open, onOpenChange, onUpdate }: OrderDetailModalProps) {
    const [notes, setNotes] = useState(order.businessNotes || "");
    const [total, setTotal] = useState(order.total?.toString() || "0");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/business/${businessId}/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessNotes: notes,
                    total: parseFloat(total) || 0,
                })
            });

            if (!res.ok) throw new Error("Update failed");

            toast.success("Order details updated");
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to save details");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Order #{order.orderNumber}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Customer Request</Label>
                        <div className="bg-muted p-2 rounded text-sm italic">
                            "{order.specialInstructions}"
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="total">Final Price (₹)</Label>
                        <Input
                            id="total"
                            type="number"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            placeholder="Set total amount for this order"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Business Notes (Private)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add internal notes about this order..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

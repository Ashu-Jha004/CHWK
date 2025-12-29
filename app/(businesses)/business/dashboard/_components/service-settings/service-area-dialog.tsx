/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/service-area-dialog.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useServiceAreas,
  useAddServiceArea,
  useUpdateServiceArea,
} from "@/hooks/business-dashboard/use-service-areas";
import {
  serviceAreaSchema,
  type ServiceAreaFormData,
} from "@/lib/validations/business-dashboard/profile/service-area";

// ==================== TYPES ====================

interface ServiceAreaDialogProps {
  businessId: string;
  areaId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==================== COMPONENT ====================

export function ServiceAreaDialog({
  businessId,
  areaId,
  open,
  onOpenChange,
}: ServiceAreaDialogProps) {
  const isEditing = !!areaId;

  // Fetch existing areas
  const { data: areas } = useServiceAreas(businessId);
  const existingArea = areas?.find((a: any) => a.id === areaId);

  // Mutations
  const { mutate: addArea, isPending: isAdding } =
    useAddServiceArea(businessId);
  const { mutate: updateArea, isPending: isUpdating } = useUpdateServiceArea();

  const isPending = isAdding || isUpdating;

  // Form setup
  const form = useForm<any>({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      areaName: "",
      pincode: "",
      city: "",
      deliveryFee: 0,
      minimumOrder: null,
      estimatedTime: "",
      isActive: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingArea) {
      form.reset({
        areaName: existingArea.areaName || "",
        pincode: existingArea.pincode || "",
        city: existingArea.city || "",
        deliveryFee: existingArea.deliveryFee ?? 0,
        minimumOrder: existingArea.minimumOrder,
        estimatedTime: existingArea.estimatedTime || "",
        isActive: existingArea.isActive ?? true,
      });
    } else if (!isEditing && open) {
      form.reset({
        areaName: "",
        pincode: "",
        city: "",
        deliveryFee: 0,
        minimumOrder: null,
        estimatedTime: "",
        isActive: true,
      });
    }
  }, [isEditing, existingArea, form, open]);

  // Submit handler
  const onSubmit = (data: ServiceAreaFormData) => {
    if (isEditing && areaId) {
      updateArea(
        { areaId, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      addArea(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Service Area" : "Add Service Area"}
          </DialogTitle>
          <DialogDescription>
            Define an area where you provide services or deliver
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Area Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="areaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sector 21, Dwarka"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Locality or neighborhood name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 110001"
                        maxLength={6}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>6-digit Indian PIN code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New Delhi"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    City name for better organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Custom delivery fee for this area
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum order amount for this area
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estimated Time */}
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 30-45 mins"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Estimated delivery or service time for this area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Make this area available for service/delivery
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Area" : "Add Area"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

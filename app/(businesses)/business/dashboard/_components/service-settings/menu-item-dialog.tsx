/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/menu-item-dialog.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useServiceSettingsStore } from "@/store/business-dashboard/service-settings-store";
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
} from "@/hooks/business-dashboard/use-menu-items";
import {
  menuItemSchema,
  type MenuItemFormData,
} from "@/lib/validations/business-dashboard/profile/menu-item";
import {
  SERVICE_TYPE_LABELS,
  DELIVERY_TYPE_LABELS,
  PRICING_TYPE_LABELS,
} from "@/types/businessDashboard/service-settings";

// ==================== TYPES ====================

interface MenuItemDialogProps {
  businessId: string;
}

// ==================== COMPONENT ====================

export function MenuItemDialog({ businessId }: MenuItemDialogProps) {
  const { editingItemId, setEditingItemId } = useServiceSettingsStore();
  const isOpen = !!editingItemId;
  const isEditing = editingItemId !== "new";

  // Fetch existing items
  const { data: items } = useMenuItems(businessId);
  const existingItem = items?.find((item: any) => item.id === editingItemId);

  // Mutations
  const { mutate: createItem, isPending: isCreating } =
    useCreateMenuItem(businessId);
  const { mutate: updateItem, isPending: isUpdating } = useUpdateMenuItem();

  const isPending = isCreating || isUpdating;

  // Form setup
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      categoryId: "temp-category-id", // ← TEMPORARY FIX
      description: "",
      itemType: "PRODUCT",
      deliveryType: "PHYSICAL",
      pricingType: "FIXED",
      basePrice: 0,
      salePrice: null,
      hourlyRate: null,
      dailyRate: null,
      priceNote: "",
      serviceDuration: null,
      requiresBooking: false,
      bufferTime: null,
      isAvailable: true,
      availableDays: [],
      availableOnline: true,
      availableAtLocation: false,
      availableOnSite: false,
      maxTravelDistance: null,
      isVeg: false, // ← Changed from null
      isVegan: false, // ← Changed from null
      isGlutenFree: false, // ← Changed from null
      isSpicy: false, // ← Changed from null
      spicyLevel: null,
      skillLevel: "",
      certification: "",
      cancellationPolicy: "",
      tags: [],
      allergens: [],
      displayOrder: 0,
      isFeatured: false,
      isRecommended: false,
      stockQuantity: null,
      image: null, // ← Changed from "" to null
    },
  });

  // Watch pricing type for conditional fields
  const pricingType = form.watch("pricingType");
  const itemType = form.watch("itemType");
  const requiresBooking = form.watch("requiresBooking");
  const availableOnSite = form.watch("availableOnSite");

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingItem) {
      form.reset({
        name: existingItem.name || "",
        categoryId: existingItem.categoryId || "default-category",
        description: existingItem.description || "",
        itemType: existingItem.itemType || "PRODUCT",
        deliveryType: existingItem.deliveryType || "PHYSICAL",
        pricingType: existingItem.pricingType || "FIXED",
        basePrice: existingItem.basePrice || 0,
        salePrice: existingItem.salePrice,
        hourlyRate: existingItem.hourlyRate,
        dailyRate: existingItem.dailyRate,
        priceNote: existingItem.priceNote || "",
        serviceDuration: existingItem.serviceDuration,
        requiresBooking: existingItem.requiresBooking || false,
        bufferTime: existingItem.bufferTime,
        isAvailable: existingItem.isAvailable ?? true,
        availableDays: existingItem.availableDays || [],
        availableOnline: existingItem.availableOnline || false,
        availableAtLocation: existingItem.availableAtLocation || false,
        availableOnSite: existingItem.availableOnSite || false,
        maxTravelDistance: existingItem.maxTravelDistance,
        isVeg: existingItem.isVeg,
        isVegan: existingItem.isVegan,
        isGlutenFree: existingItem.isGlutenFree,
        isSpicy: existingItem.isSpicy,
        spicyLevel: existingItem.spicyLevel,
        skillLevel: existingItem.skillLevel || "",
        certification: existingItem.certification || "",
        cancellationPolicy: existingItem.cancellationPolicy || "",
        tags: existingItem.tags || [],
        allergens: existingItem.allergens || [],
        displayOrder: existingItem.displayOrder || 0,
        isFeatured: existingItem.isFeatured || false,
        isRecommended: existingItem.isRecommended || false,
        stockQuantity: existingItem.stockQuantity,
        image: existingItem.image || "",
      });
    } else if (!isEditing && isOpen) {
      form.reset();
    }
  }, [isEditing, existingItem, form, isOpen]);

  // Submit handler
  // Submit handler
  const onSubmit = (data: MenuItemFormData) => {
    console.log("[MENU_ITEM_DIALOG] Form submitted with data:", data);
    console.log("[MENU_ITEM_DIALOG] isEditing:", isEditing);
    console.log("[MENU_ITEM_DIALOG] editingItemId:", editingItemId);

    if (isEditing && editingItemId !== "new") {
      console.log("[MENU_ITEM_DIALOG] Updating item...");
      updateItem(
        { itemId: editingItemId, data },
        {
          onSuccess: () => {
            console.log("[MENU_ITEM_DIALOG] Update success!");
            setEditingItemId(null);
            form.reset();
          },
          onError: (error) => {
            console.error("[MENU_ITEM_DIALOG] Update error:", error);
          },
        }
      );
    } else {
      console.log("[MENU_ITEM_DIALOG] Creating new item...");
      createItem(data, {
        onSuccess: () => {
          console.log("[MENU_ITEM_DIALOG] Create success!");
          setEditingItemId(null);
          form.reset();
        },
        onError: (error) => {
          console.error("[MENU_ITEM_DIALOG] Create error:", error);
        },
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditingItemId(null);
          form.reset();
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEditing ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your service or product details"
              : "Add a new service or product to your catalog"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                console.log("📝 [FORM] Form submit event triggered!");
                console.log("📝 [FORM] Event:", e);
                form.handleSubmit(onSubmit)(e);
              }}
              onInvalid={(e) => {
                console.log("⚠️ [FORM] Form is INVALID!");
                console.log("⚠️ [FORM] Invalid event:", e);
              }}
              className="space-y-6 pb-6"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Hair Cut, Plumbing Service"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your service or product..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Item Type & Delivery Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SERVICE_TYPE_LABELS).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Method *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(DELIVERY_TYPE_LABELS).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>

                {/* Pricing Type */}
                <FormField
                  control={form.control}
                  name="pricingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Model *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pricing model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PRICING_TYPE_LABELS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Pricing Fields */}
                {pricingType === "FIXED" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price (₹) *</FormLabel>
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
                                field.onChange(
                                  value ? parseFloat(value) : null
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price (₹)</FormLabel>
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
                                field.onChange(
                                  value ? parseFloat(value) : null
                                );
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Discounted price (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {pricingType === "HOURLY" && (
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (₹) *</FormLabel>
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
                        <FormDescription>Price per hour</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {pricingType === "DAILY" && (
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate (₹) *</FormLabel>
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
                        <FormDescription>Price per day</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(pricingType === "NEGOTIABLE" ||
                  pricingType === "STARTING_FROM") && (
                  <FormField
                    control={form.control}
                    name="priceNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Note</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Call for pricing, Starting from ₹500"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional pricing information for customers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Service Details */}
              {itemType === "SERVICE" && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Service Details</h3>

                    {/* Service Duration */}
                    <FormField
                      control={form.control}
                      name="serviceDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="30"
                              min="5"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : null);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            How long does this service take?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Requires Booking */}
                    <FormField
                      control={form.control}
                      name="requiresBooking"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Requires Booking</FormLabel>
                            <FormDescription>
                              Customers must book an appointment in advance
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Buffer Time */}
                    {requiresBooking && (
                      <FormField
                        control={form.control}
                        name="bufferTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buffer Time (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="15"
                                min="0"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value ? parseInt(value) : null
                                  );
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Time needed between bookings for preparation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator />
                </>
              )}

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability</h3>

                {/* Available Toggle */}
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Currently Available</FormLabel>
                        <FormDescription>
                          Make this item visible and available for customers
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Where Available */}
                <div className="space-y-3">
                  <FormLabel>Where is this available?</FormLabel>

                  <FormField
                    control={form.control}
                    name="availableOnline"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Online</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availableAtLocation"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          At Business Location
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availableOnSite"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          On-Site (Visit Customer)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Max Travel Distance */}
                {availableOnSite && (
                  <FormField
                    control={form.control}
                    name="maxTravelDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Travel Distance (km) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            min="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseFloat(value) : null);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum distance you&apos;re willing to travel
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItemId(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const formState = form.formState;
                    const formValues = form.getValues();

                    console.log("=== FULL DEBUG INFO ===");
                    console.log(
                      "📋 Form Values:",
                      JSON.stringify(formValues, null, 2)
                    );
                    console.log(
                      "❌ Form Errors:",
                      JSON.stringify(formState.errors, null, 2)
                    );
                    console.log("✅ Is Valid:", formState.isValid);
                    console.log("🔄 Is Validating:", formState.isValidating);
                    console.log("📊 Dirty Fields:", formState.dirtyFields);
                    console.log("👆 Touched Fields:", formState.touchedFields);

                    // Check each field individually
                    Object.keys(formValues).forEach((key) => {
                      const typedKey = key as keyof MenuItemFormData;
                      const error = formState.errors[typedKey];
                      if (error) {
                        // Field errors can be nested objects or a FieldError with a message
                        const message =
                          (error as { message?: string })?.message ??
                          JSON.stringify(error);
                        console.log(`🔴 ERROR in ${key}:`, message);
                      }
                    });
                  }}
                >
                  🐛 Debug Form
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  onClick={(e) => {
                    console.log("🖱️ [BUTTON] Submit button CLICKED!");
                    console.log(
                      "🖱️ [BUTTON] Button type:",
                      e.currentTarget.type
                    );
                    console.log("🖱️ [BUTTON] Is pending:", isPending);
                  }}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

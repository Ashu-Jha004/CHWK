// components/business-onboarding/steps/step5-business-details.tsx
// Step 5: Business details, features, and amenities

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag,
  Calendar,
  Truck,
  Store,
  Utensils,
  Phone,
  DollarSign,
  Check,
} from "lucide-react";
import { PriceRange } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  businessDetailsSchema,
  type BusinessDetailsFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useBusinessDetails,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import {
  getAmenitiesByCategory,
  type AmenityOption,
} from "@/app/(businesses)/business/actions/amenities.actions";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormGrid, FormSection } from "../form-fields";
import { cn } from "@/lib/utils";

const PRICE_RANGES = [
  {
    value: "BUDGET",
    label: "Budget",
    icon: "₹",
    description: "Up to ₹500 per person",
  },
  {
    value: "MODERATE",
    label: "Moderate",
    icon: "₹₹",
    description: "₹500 - ₹1500",
  },
  {
    value: "EXPENSIVE",
    label: "Expensive",
    icon: "₹₹₹",
    description: "₹1500 - ₹3000",
  },
  {
    value: "LUXURY",
    label: "Luxury",
    icon: "₹₹₹₹",
    description: "Above ₹3000",
  },
];

export function Step5BusinessDetails() {
  const businessDetails = useBusinessDetails();
  const updateBusinessDetails = useBusinessOnboardingStore(
    (state) => state.updateBusinessDetails
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [amenitiesByCategory, setAmenitiesByCategory] = useState<
    Record<string, AmenityOption[]>
  >({});
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    businessDetails.amenityIds || []
  );

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(businessDetailsSchema),
    mode: "onChange",
    defaultValues: {
      priceRange: businessDetails.priceRange || undefined,
      acceptsBookings: businessDetails.acceptsBookings || false,
      acceptsOrders: businessDetails.acceptsOrders || false,
      hasDelivery: businessDetails.hasDelivery || false,
      hasPickup: businessDetails.hasPickup || false,
      hasDineIn: businessDetails.hasDineIn || false,
      hasEmergencyService: businessDetails.hasEmergencyService || false,
      deliveryRadius: businessDetails.deliveryRadius || undefined,
      minOrderAmount: businessDetails.minOrderAmount || undefined,
      deliveryFee: businessDetails.deliveryFee || undefined,
      emergencyContactNumber: businessDetails.emergencyContactNumber || "",
      emergencyExtraCharge: businessDetails.emergencyExtraCharge || undefined,
      minAdvanceBookingHours: businessDetails.minAdvanceBookingHours || 2,
      maxAdvanceBookingDays: businessDetails.maxAdvanceBookingDays || 30,
      cancellationPolicy: businessDetails.cancellationPolicy || "",
      amenityIds: businessDetails.amenityIds || [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = form;

  // Fetch amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setIsLoadingAmenities(true);
        const data = await getAmenitiesByCategory();
        setAmenitiesByCategory(data);
      } catch (error) {
        console.error("[Business Details] Error fetching amenities:", error);
      } finally {
        setIsLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  // Auto-save to store
  useEffect(() => {
    const subscription = watch((value) => {
      updateBusinessDetails(value as Partial<BusinessDetailsFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBusinessDetails]);

  // Update amenities in form
  useEffect(() => {
    setValue("amenityIds", selectedAmenities);
  }, [selectedAmenities, setValue]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const hasDelivery = watch("hasDelivery");
  const hasEmergencyService = watch("hasEmergencyService");

  const onSubmit: SubmitHandler<BusinessDetailsFormData> = async (data) => {
    try {
      console.log("[Step 5] Business details data:", data);

      updateBusinessDetails(data);
      markStepComplete(5);
      nextStep();
    } catch (error) {
      console.error("[Step 5] Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Details & Features"
        description="Tell us more about your business features and amenities"
        step={5}
      >
        {/* Price Range */}
        <FormSection title="Price Range">
          <FormField
            label="Select Price Range"
            error={errors.priceRange?.message}
            hint="Help customers know what to expect"
          >
            <Select
              value={watch("priceRange") || ""}
              onValueChange={(value) =>
                setValue("priceRange", value as PriceRange)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{range.icon}</span>
                      <div>
                        <span className="font-medium">{range.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {range.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>

        {/* Features */}
        <FormSection title="Business Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Accepts Bookings */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="acceptsBookings" className="font-medium">
                    Accepts Bookings
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Appointments & reservations
                  </p>
                </div>
              </div>
              <Switch
                id="acceptsBookings"
                checked={watch("acceptsBookings")}
                onCheckedChange={(checked) =>
                  setValue("acceptsBookings", checked)
                }
              />
            </div>

            {/* Accepts Orders */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="acceptsOrders" className="font-medium">
                    Accepts Orders
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Online food/product orders
                  </p>
                </div>
              </div>
              <Switch
                id="acceptsOrders"
                checked={watch("acceptsOrders")}
                onCheckedChange={(checked) =>
                  setValue("acceptsOrders", checked)
                }
              />
            </div>

            {/* Has Delivery */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="hasDelivery" className="font-medium">
                    Home Delivery
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Deliver to customer location
                  </p>
                </div>
              </div>
              <Switch
                id="hasDelivery"
                checked={watch("hasDelivery")}
                onCheckedChange={(checked) => setValue("hasDelivery", checked)}
              />
            </div>

            {/* Has Pickup */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="hasPickup" className="font-medium">
                    Pickup Available
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Customers can pick up orders
                  </p>
                </div>
              </div>
              <Switch
                id="hasPickup"
                checked={watch("hasPickup")}
                onCheckedChange={(checked) => setValue("hasPickup", checked)}
              />
            </div>

            {/* Has Dine-In */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="hasDineIn" className="font-medium">
                    Dine-In Available
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Customers can dine at location
                  </p>
                </div>
              </div>
              <Switch
                id="hasDineIn"
                checked={watch("hasDineIn")}
                onCheckedChange={(checked) => setValue("hasDineIn", checked)}
              />
            </div>

            {/* Emergency Service */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="hasEmergencyService" className="font-medium">
                    Emergency Service
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    24/7 emergency availability
                  </p>
                </div>
              </div>
              <Switch
                id="hasEmergencyService"
                checked={watch("hasEmergencyService")}
                onCheckedChange={(checked) =>
                  setValue("hasEmergencyService", checked)
                }
              />
            </div>
          </div>
        </FormSection>

        {/* Delivery Settings */}
        {hasDelivery && (
          <FormSection title="Delivery Settings">
            <FormGrid columns={3}>
              <FormField
                label="Delivery Radius (meters)"
                required
                error={errors.deliveryRadius?.message}
                hint="Maximum delivery distance"
              >
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("deliveryRadius", { valueAsNumber: true })}
                    type="number"
                    placeholder="5000"
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="Minimum Order (₹)"
                error={errors.minOrderAmount?.message}
                hint="Minimum order value"
              >
                <Input
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  type="number"
                  placeholder="100"
                />
              </FormField>

              <FormField
                label="Delivery Fee (₹)"
                required
                error={errors.deliveryFee?.message}
                hint="Standard delivery charge"
              >
                <Input
                  {...register("deliveryFee", { valueAsNumber: true })}
                  type="number"
                  placeholder="50"
                />
              </FormField>
            </FormGrid>
          </FormSection>
        )}

        {/* Emergency Service Settings */}
        {hasEmergencyService && (
          <FormSection title="Emergency Service Details">
            <FormGrid columns={2}>
              <FormField
                label="Emergency Contact Number"
                required
                error={errors.emergencyContactNumber?.message}
                hint="10-digit mobile number"
              >
                <Input
                  {...register("emergencyContactNumber")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </FormField>

              <FormField
                label="Emergency Extra Charge (₹)"
                error={errors.emergencyExtraCharge?.message}
                hint="Additional charge for emergency calls"
              >
                <Input
                  {...register("emergencyExtraCharge", { valueAsNumber: true })}
                  type="number"
                  placeholder="500"
                />
              </FormField>
            </FormGrid>
          </FormSection>
        )}

        {/* Booking Policies */}
        <FormSection title="Booking & Cancellation Policies">
          <FormGrid columns={2}>
            <FormField
              label="Advance Booking (Hours)"
              error={errors.minAdvanceBookingHours?.message}
              hint="Minimum hours notice required"
            >
              <Input
                {...register("minAdvanceBookingHours", { valueAsNumber: true })}
                type="number"
                placeholder="2"
              />
            </FormField>

            <FormField
              label="Max Advance Days"
              error={errors.maxAdvanceBookingDays?.message}
              hint="How far ahead can customers book"
            >
              <Input
                {...register("maxAdvanceBookingDays", { valueAsNumber: true })}
                type="number"
                placeholder="30"
              />
            </FormField>
          </FormGrid>

          <FormField
            label="Cancellation Policy"
            error={errors.cancellationPolicy?.message}
            hint="Describe your cancellation and refund policy"
          >
            <textarea
              {...register("cancellationPolicy")}
              placeholder="e.g., Free cancellation up to 24 hours before booking..."
              className="w-full min-h-24 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={500}
            />
          </FormField>
        </FormSection>

        {/* Amenities */}
        <FormSection title="Amenities">
          <p className="text-sm text-muted-foreground mb-4">
            Select all amenities available at your business
          </p>

          {isLoadingAmenities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(amenitiesByCategory).map(
                ([category, amenities]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-4">
                      {amenities.map((amenity) => {
                        const isSelected = selectedAmenities.includes(
                          amenity.id
                        );
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {amenity.icon && (
                              <span className="text-lg">{amenity.icon}</span>
                            )}
                            <span className="text-sm font-medium flex-1">
                              {amenity.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              {/* Selected Count */}
              {selectedAmenities.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>{selectedAmenities.length}</strong> amenities
                    selected
                  </p>
                </div>
              )}
            </div>
          )}
        </FormSection>
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!isValid}
      />
    </form>
  );
}

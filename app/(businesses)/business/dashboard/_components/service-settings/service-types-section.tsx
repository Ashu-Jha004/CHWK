/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/service-types-section.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  useServiceSettings,
  useUpdateServiceSettings,
} from "@/hooks/business-dashboard/use-service-settings";
import {
  serviceSettingsSchema,
  type ServiceSettingsFormData,
} from "@/lib/validations/business-dashboard/profile/service-settings";

// ==================== TYPES ====================

interface ServiceTypesSectionProps {
  businessId: string;
}

// ==================== COMPONENT ====================

export function ServiceTypesSection({ businessId }: ServiceTypesSectionProps) {
  // Fetch current settings
  const { data: settings, isLoading } = useServiceSettings(businessId);
  const { mutate: updateSettings, isPending } =
    useUpdateServiceSettings(businessId);

  // Form setup
  const form = useForm<any>({
    resolver: zodResolver(serviceSettingsSchema),
    defaultValues: {
      offersProducts: false,
      offersServices: false,
      offersDineIn: false,
      offersDelivery: false,
      offersPickup: false,
      offersOnline: false,
      offersOnSite: false,
      serviceRadiusKm: null,
      acceptsCash: true,
      acceptsUPI: false,
      acceptsCards: false,
      acceptsNetBanking: false,
      acceptsWallets: false,
      requiresAdvancePayment: false,
      advancePaymentPercent: null,
      acceptsBookings: false,
      minAdvanceBookingHours: 2,
      maxAdvanceBookingDays: 30,
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      form.reset({
        offersProducts: settings.offersProducts || false,
        offersServices: settings.offersServices || false,
        offersDineIn: settings.offersDineIn || false,
        offersDelivery: settings.offersDelivery || false,
        offersPickup: settings.offersPickup || false,
        offersOnline: settings.offersOnline || false,
        offersOnSite: settings.offersOnSite || false,
        serviceRadiusKm: settings.serviceRadiusKm,
        acceptsCash: settings.acceptsCash ?? true,
        acceptsUPI: settings.acceptsUPI || false,
        acceptsCards: settings.acceptsCards || false,
        acceptsNetBanking: settings.acceptsNetBanking || false,
        acceptsWallets: settings.acceptsWallets || false,
        requiresAdvancePayment: settings.requiresAdvancePayment || false,
        advancePaymentPercent: settings.advancePaymentPercent,
        acceptsBookings: settings.acceptsBookings || false,
        minAdvanceBookingHours: settings.minAdvanceBookingHours || 2,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays || 30,
      });
    }
  }, [settings, form]);

  // Submit handler
  const onSubmit = (data: ServiceSettingsFormData) => {
    updateSettings(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Service Offerings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">What Do You Offer?</h3>
            <p className="text-sm text-muted-foreground">
              Select all that apply to your business
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Products */}
            <FormField
              control={form.control}
              name="offersProducts"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Products</FormLabel>
                    <FormDescription>
                      Physical or digital products
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Services */}
            <FormField
              control={form.control}
              name="offersServices"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Services</FormLabel>
                    <FormDescription>Professional services</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Dine-In */}
            <FormField
              control={form.control}
              name="offersDineIn"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dine-In</FormLabel>
                    <FormDescription>
                      Customers visit your location
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Delivery */}
            <FormField
              control={form.control}
              name="offersDelivery"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Delivery</FormLabel>
                    <FormDescription>
                      Deliver to customer location
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Pickup */}
            <FormField
              control={form.control}
              name="offersPickup"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Pickup</FormLabel>
                    <FormDescription>Customer picks up order</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Online */}
            <FormField
              control={form.control}
              name="offersOnline"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Online Service</FormLabel>
                    <FormDescription>
                      Video call, remote service
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* On-Site */}
            <FormField
              control={form.control}
              name="offersOnSite"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>On-Site Service</FormLabel>
                    <FormDescription>Visit customer location</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Service Radius */}
        <FormField
          control={form.control}
          name="serviceRadiusKm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Radius (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="10"
                    className="max-w-[200px]"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : null);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    kilometers
                  </span>
                </div>
              </FormControl>
              <FormDescription>
                How far can you travel or deliver? (Leave empty for unlimited)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Booking Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Booking Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure appointment and reservation settings
            </p>
          </div>

          {/* Accept Bookings */}
          <FormField
            control={form.control}
            name="acceptsBookings"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Accept Bookings/Reservations</FormLabel>
                  <FormDescription>
                    Allow customers to book appointments or reserve tables
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Advance Booking Settings */}
          {form.watch("acceptsBookings") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
              <FormField
                control={form.control}
                name="minAdvanceBookingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Notice</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="2"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          hours
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How far in advance customers must book
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAdvanceBookingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Advance</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          days
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How far ahead customers can book
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

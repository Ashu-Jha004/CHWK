/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/business/dashboard/_components/service-settings/payment-methods-section.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PaymentMethodsSectionProps {
  businessId: string;
}

// ==================== COMPONENT ====================

export function PaymentMethodsSection({
  businessId,
}: PaymentMethodsSectionProps) {
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
        {/* Payment Methods */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Accepted Payment Methods</h3>
            <p className="text-sm text-muted-foreground">
              Select all payment methods you accept
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash */}
            <FormField
              control={form.control}
              name="acceptsCash"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex items-start gap-3 flex-1">
                    <Banknote className="h-5 w-5 text-secondary mt-0.5" />
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Cash</FormLabel>
                      <FormDescription>Accept cash payments</FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* UPI */}
            <FormField
              control={form.control}
              name="acceptsUPI"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex items-start gap-3 flex-1">
                    <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">UPI</FormLabel>
                      <FormDescription>
                        PhonePe, Google Pay, Paytm, etc.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Cards */}
            <FormField
              control={form.control}
              name="acceptsCards"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex items-start gap-3 flex-1">
                    <CreditCard className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Credit/Debit Cards
                      </FormLabel>
                      <FormDescription>
                        Visa, Mastercard, RuPay, etc.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Net Banking */}
            <FormField
              control={form.control}
              name="acceptsNetBanking"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex items-start gap-3 flex-1">
                    <CreditCard className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Net Banking
                      </FormLabel>
                      <FormDescription>Direct bank transfers</FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Wallets */}
            <FormField
              control={form.control}
              name="acceptsWallets"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex items-start gap-3 flex-1">
                    <Wallet className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Digital Wallets
                      </FormLabel>
                      <FormDescription>
                        Mobikwik, Amazon Pay, etc.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Advance Payment Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Advance Payment</h3>
            <p className="text-sm text-muted-foreground">
              Require partial payment upfront
            </p>
          </div>

          {/* Require Advance Payment */}
          <FormField
            control={form.control}
            name="requiresAdvancePayment"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Require Advance Payment</FormLabel>
                  <FormDescription>
                    Ask customers to pay a percentage upfront when booking
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Advance Payment Percentage */}
          {form.watch("requiresAdvancePayment") && (
            <FormField
              control={form.control}
              name="advancePaymentPercent"
              render={({ field }) => (
                <FormItem className="pl-4">
                  <FormLabel>Advance Payment Percentage</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="50"
                        min="1"
                        max="100"
                        className="max-w-[200px]"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : null);
                        }}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    What percentage must be paid in advance? (1-100%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Payment Integration
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            These settings help customers know which payment methods you accept.
            For online payment processing, you&apos;ll need to integrate payment
            gateways like Razorpay, Stripe, or PayU separately.
          </p>
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
            Save Payment Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

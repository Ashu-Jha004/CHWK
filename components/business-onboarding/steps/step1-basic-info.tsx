/* eslint-disable react-hooks/incompatible-library */
// components/business-onboarding/steps/step1-basic-info.tsx
// Step 1: Basic business information collection (Final Fixed Version)

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Globe, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  basicInfoSchema,
  type BasicInfoFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useBasicInfo,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormGrid, FormSection } from "../form-fields";

export function Step1BasicInfo() {
  const basicInfo = useBasicInfo();
  const updateBasicInfo = useBusinessOnboardingStore(
    (state) => state.updateBasicInfo
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [isPartOfChain, setIsPartOfChain] = useState(
    basicInfo.isPartOfChain || false
  );

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: basicInfo.name || "",
      description: basicInfo.description || "",
      shortDescription: basicInfo.shortDescription || "",
      email: basicInfo.email || "",
      phone: basicInfo.phone || "",
      alternatePhone: basicInfo.alternatePhone || "",
      whatsappNumber: basicInfo.whatsappNumber || "",
      website: basicInfo.website || "",
      isPartOfChain: basicInfo.isPartOfChain || false,
      chainId: basicInfo.chainId || "",
      chainName: basicInfo.chainName || "",
      branchName: basicInfo.branchName || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = form;

  // Watch form changes and auto-save to store
  /* trunk-ignore(eslint) */

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // ✅ FIXED: Only save on user interaction
      if (type === "change") {
        updateBasicInfo(value as Partial<BasicInfoFormData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBasicInfo]);

  // Handle chain toggle
  useEffect(() => {
    setValue("isPartOfChain", isPartOfChain);
  }, [isPartOfChain, setValue]);

  const onSubmit: SubmitHandler<BasicInfoFormData> = async (data) => {
    try {
      console.log("[Step 1] Form data:", data);

      // Save to store
      updateBasicInfo(data);
      markStepComplete(1);

      // Move to next step
      nextStep();
    } catch (error) {
      console.error("[Step 1] Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Basic Information"
        description="Let's start with the essential details about your business"
        step={1}
      >
        {/* Business Name */}
        <FormSection title="Business Details">
          <FormField
            label="Business Name"
            required
            error={errors.name?.message}
            hint="Enter the official name of your business as it appears on documents"
          >
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("name")}
                placeholder="e.g., Sharma Restaurant"
                className="pl-10"
              />
            </div>
          </FormField>

          <FormField
            label="Short Description"
            error={errors.shortDescription?.message}
            hint="A brief one-line description (max 255 characters)"
          >
            <Input
              {...register("shortDescription")}
              placeholder="e.g., Authentic North Indian cuisine"
              maxLength={255}
            />
          </FormField>

          <FormField
            label="Detailed Description"
            error={errors.description?.message}
            hint="Describe your business, services, specialties, and what makes you unique"
          >
            <textarea
              {...register("description")}
              placeholder="Tell customers about your business..."
              className="w-full min-h-30 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={2000}
            />
          </FormField>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Contact Information">
          <FormGrid columns={2}>
            <FormField
              label="Email Address"
              required
              error={errors.email?.message}
              hint="Primary email for customer communication"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="business@example.com"
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField
              label="Phone Number"
              required
              error={errors.phone?.message}
              hint="10-digit mobile number"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField
              label="Alternate Phone"
              error={errors.alternatePhone?.message}
              hint="Optional backup number"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("alternatePhone")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-10"
                />
              </div>
            </FormField>

            <FormField
              label="WhatsApp Number"
              error={errors.whatsappNumber?.message}
              hint="For quick customer communication"
            >
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("whatsappNumber")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-10"
                />
              </div>
            </FormField>
          </FormGrid>

          <FormField
            label="Website"
            error={errors.website?.message}
            hint="Your business website URL (optional)"
          >
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("website")}
                type="url"
                placeholder="https://www.yourbusiness.com"
                className="pl-10"
              />
            </div>
          </FormField>
        </FormSection>

        {/* Business Chain Information */}
        <FormSection title="Chain Information (Optional)">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Is your business part of a chain?
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this if you have multiple branches or outlets
              </p>
            </div>
            <Switch
              checked={isPartOfChain}
              onCheckedChange={setIsPartOfChain}
            />
          </div>

          {isPartOfChain && (
            <div className="space-y-4 animate-fade-in-up">
              <FormField
                label="Chain Name"
                required
                error={errors.chainName?.message}
                hint="Enter the name of your business chain"
              >
                <Input
                  {...register("chainName")}
                  placeholder="e.g., Sharma Restaurant Chain"
                />
              </FormField>

              <FormField
                label="Branch Name"
                error={errors.branchName?.message}
                hint="Specific location/branch identifier (e.g., 'Connaught Place', 'Sector 18')"
              >
                <Input
                  {...register("branchName")}
                  placeholder="e.g., Connaught Place"
                />
              </FormField>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Chain management will help customers
                  find all your branches. You can add more branches later from
                  your dashboard.
                </p>
              </div>
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

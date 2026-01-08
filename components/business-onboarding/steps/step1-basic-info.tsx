/* eslint-disable react-hooks/incompatible-library */
// components/business-onboarding/steps/step1-basic-info.tsx
// Step 1: Basic business information collection (Premium Orange Version)

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, Globe, MessageSquare, Info, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
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

      toast.success("Identity verified! Let's pin your location.");

      // Move to next step
      nextStep();
    } catch (error) {
      console.error("[Step 1] Error:", error);
      toast.error("Something went wrong. Please check your inputs.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Identity & Branding"
        description="First, let's establish your business identity and how customers can reach you."
        step={1}
      >
        {/* Business Name */}
        <FormSection title="Business Presence">
          <FormField
            label="Business Name"
            required
            error={errors.name?.message}
            hint="Input the name customers know you by"
          >
            <div className="relative group">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                {...register("name")}
                placeholder="e.g., Golden Crust Bakery"
                className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
          </FormField>

          <FormField
            label="Tagline / Short Description"
            error={errors.shortDescription?.message}
            hint="A catchy one-liner (max 255 characters)"
          >
             <div className="relative group">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                {...register("shortDescription")}
                placeholder="e.g., Authentic sourdough & artisan coffee"
                maxLength={255}
                className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
          </FormField>

          <FormField
            label="Business Story"
            error={errors.description?.message}
            hint="Describe your legacy, specialties, and why customers choose you"
          >
            <textarea
              {...register("description")}
              placeholder="Tell your story here..."
              className="w-full min-h-32 px-4 py-3 text-sm border-2 border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary resize-none transition-all"
              maxLength={2000}
            />
          </FormField>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Communication Channels">
          <FormGrid columns={2}>
            <FormField
              label="Business Email"
              required
              error={errors.email?.message}
              hint="Where you'll receive leads"
            >
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="hello@bakery.com"
                  className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                />
              </div>
            </FormField>

            <FormField
              label="Primary Contact"
              required
              error={errors.phone?.message}
              hint="Main number for customers"
            >
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                />
              </div>
            </FormField>

            <FormField
              label="Secondary Contact"
              error={errors.alternatePhone?.message}
              hint="Optional backup number"
            >
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("alternatePhone")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                />
              </div>
            </FormField>

            <FormField
              label="WhatsApp Business"
              error={errors.whatsappNumber?.message}
              hint="For direct customer chats"
            >
              <div className="relative group">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("whatsappNumber")}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                />
              </div>
            </FormField>
          </FormGrid>

          <FormField
            label="Digital Presence"
            error={errors.website?.message}
            hint="Your official website or store URL"
          >
            <div className="relative group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                {...register("website")}
                type="url"
                placeholder="https://www.goldencrust.in"
                className="pl-11 h-12 border-2 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
          </FormField>
        </FormSection>

        {/* Business Chain Information */}
        <FormSection title="Expansion & Chain Info">
          <div className={cn(
             "flex items-center justify-between p-6 rounded-2xl border-2 transition-all",
             isPartOfChain ? "border-primary bg-primary/5 shadow-md shadow-primary/5" : "bg-muted/30 border-border"
          )}>
            <div className="space-y-1">
              <Label className="text-lg font-bold">
                Part of a Multi-outlet Chain?
              </Label>
              <p className="text-sm text-muted-foreground font-medium">
                Manage multiple branches from a single identifier
              </p>
            </div>
            <Switch
              checked={isPartOfChain}
              onCheckedChange={(checked) => {
                setIsPartOfChain(checked);
                toast.info(checked ? "Chain mode enabled" : "Single outlet mode enabled");
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {isPartOfChain && (
            <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
               <FormGrid columns={2}>
                <FormField
                  label="Chain Name"
                  required
                  error={errors.chainName?.message}
                  hint="The umbrella brand name"
                >
                  <Input
                    {...register("chainName")}
                    placeholder="e.g., Golden Crust Group"
                    className="h-12 border-2 rounded-xl"
                  />
                </FormField>

                <FormField
                  label="Branch Identity"
                  error={errors.branchName?.message}
                  hint="Which outlet is this?"
                >
                  <Input
                    {...register("branchName")}
                    placeholder="e.g., South Ex Branch"
                    className="h-12 border-2 rounded-xl"
                  />
                </FormField>
              </FormGrid>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  <strong>Network Advantage:</strong> Chain management links all your outlets together,
                  allowing customers to discover your entire presence across different locations.
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

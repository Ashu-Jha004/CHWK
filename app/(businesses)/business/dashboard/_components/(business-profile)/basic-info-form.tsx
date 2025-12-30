// app/business/dashboard/_components/basic-info-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Business } from "@prisma/client";
import { Save, Loader2 } from "lucide-react";
import {
  basicInfoSchema,
  BasicInfoFormData,
} from "@/lib/validations/business-dashboard/profile/business";
import { useUpdateBasicInfo } from "@/hooks/business-dashboard/use-basic-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "../form-field";
import { cn } from "@/lib/utils";
import { SEOMetaDialog } from "./seo/seo-meta-dialog";

interface BasicInfoFormProps {
  business: Business;
}

export function BasicInfoForm({ business }: BasicInfoFormProps) {
  const mutation = useUpdateBasicInfo(business.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: business.name,
      description: business.description || "",
      shortDescription: business.shortDescription || "",
      email: business.email || "",
      phone: business.phone,
      alternatePhone: business.alternatePhone || "",
      whatsappNumber: business.whatsappNumber || "",
      website: business.website || "",
      addressLine1: business.addressLine1,
      addressLine2: business.addressLine2 || "",
      landmark: business.landmark || "",
      area: business.area || "",
      city: business.city,
      district: business.district || "",
      state: business.state,
      pincode: business.pincode,
      chainId: business.chainId || "",
      branchName: business.branchName || "",
    },
  });

  const onSubmit = (data: BasicInfoFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Details Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Basic Details</h3>
          <p className="text-sm text-muted-foreground">
            Primary information about your business
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Business Name"
            required
            error={errors.name?.message}
            className="md:col-span-2"
          >
            <Input
              {...register("name")}
              placeholder="Enter business name"
              disabled={mutation.isPending}
            />
          </FormField>
          <SEOMetaDialog
            businessId={business.id}
            businessName={business.name}
            initialData={{
              metaTitle: business.metaTitle,
              metaDescription: business.metaDescription,
              metadataKeywords: business.metadataKeywords || [],
            }}
          />

          <FormField
            label="Short Description"
            error={errors.shortDescription?.message}
            description="Brief tagline (max 255 characters)"
            className="md:col-span-2"
          >
            <Input
              {...register("shortDescription")}
              placeholder="E.g., Best Italian restaurant in Delhi"
              maxLength={255}
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="Full Description"
            error={errors.description?.message}
            description="Detailed description of your business"
            className="md:col-span-2"
          >
            <Textarea
              {...register("description")}
              placeholder="Describe your business, services, and what makes you unique..."
              rows={5}
              maxLength={2000}
              disabled={mutation.isPending}
            />
          </FormField>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            How customers can reach you
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Email Address"
            required
            error={errors.email?.message}
          >
            <Input
              {...register("email")}
              type="email"
              placeholder="business@example.com"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="Primary Phone"
            required
            error={errors.phone?.message}
          >
            <Input
              {...register("phone")}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="Alternate Phone"
            error={errors.alternatePhone?.message}
          >
            <Input
              {...register("alternatePhone")}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="WhatsApp Number"
            error={errors.whatsappNumber?.message}
            description="For customer inquiries"
          >
            <Input
              {...register("whatsappNumber")}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="Website"
            error={errors.website?.message}
            className="md:col-span-2"
          >
            <Input
              {...register("website")}
              type="url"
              placeholder="https://www.yourbusiness.com"
              disabled={mutation.isPending}
            />
          </FormField>
        </div>
      </div>

      {/* Location Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Business Location</h3>
          <p className="text-sm text-muted-foreground">
            Your business address details
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Address Line 1"
            required
            error={errors.addressLine1?.message}
            className="md:col-span-2"
          >
            <Input
              {...register("addressLine1")}
              placeholder="Building number, street name"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField
            label="Address Line 2"
            error={errors.addressLine2?.message}
            className="md:col-span-2"
          >
            <Input
              {...register("addressLine2")}
              placeholder="Apartment, suite, floor (optional)"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="Landmark" error={errors.landmark?.message}>
            <Input
              {...register("landmark")}
              placeholder="Near metro station, mall, etc."
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="Area/Locality" error={errors.area?.message}>
            <Input
              {...register("area")}
              placeholder="Sector, locality name"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="City" required error={errors.city?.message}>
            <Input
              {...register("city")}
              placeholder="City name"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="District" error={errors.district?.message}>
            <Input
              {...register("district")}
              placeholder="District name"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="State" required error={errors.state?.message}>
            <Input
              {...register("state")}
              placeholder="State name"
              disabled={mutation.isPending}
            />
          </FormField>

          <FormField label="PIN Code" required error={errors.pincode?.message}>
            <Input
              {...register("pincode")}
              placeholder="123456"
              maxLength={6}
              disabled={mutation.isPending}
            />
          </FormField>
        </div>
      </div>

      {/* Chain Information (Optional) */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Chain Information</h3>
          <p className="text-sm text-muted-foreground">
            If you&apos;re part of a business chain (optional)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Branch Name"
            error={errors.branchName?.message}
            description="E.g., Connaught Place, Sector 18"
            className="md:col-span-2"
          >
            <Input
              {...register("branchName")}
              placeholder="Branch or location name"
              disabled={mutation.isPending}
            />
          </FormField>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {isDirty ? "You have unsaved changes" : "All changes saved"}
        </p>

        <Button
          type="submit"
          disabled={mutation.isPending || !isDirty}
          className={cn(
            "gap-2 min-w-[120px]",
            mutation.isPending && "cursor-not-allowed"
          )}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

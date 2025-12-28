// components/business-onboarding/steps/step3-categories.tsx
// Step 3: Category selection with search

"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Check, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useCategories,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import {
  getActiveCategories,
  type CategoryOption,
} from "@/app/(businesses)/business/actions/categories.actions";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormSection } from "../form-fields";
import { cn } from "@/lib/utils";

export function Step3Categories() {
  const categories = useCategories();
  const updateCategories = useBusinessOnboardingStore(
    (state) => state.updateCategories
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrimary, setSelectedPrimary] = useState<string>(
    categories.primaryCategoryId || ""
  );
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>(
    categories.additionalCategoryIds || []
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      primaryCategoryId: categories.primaryCategoryId || "",
      additionalCategoryIds: categories.additionalCategoryIds || [],
    },
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = form;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getActiveCategories();
        setAllCategories(data);
      } catch (error) {
        console.error("[Categories] Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-save to store
  useEffect(() => {
    const subscription = watch((value) => {
      updateCategories(value as Partial<CategoryFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateCategories]);

  // Update form when selections change
  useEffect(() => {
    setValue("primaryCategoryId", selectedPrimary);
    setValue("additionalCategoryIds", selectedAdditional);
  }, [selectedPrimary, selectedAdditional, setValue]);

  const handlePrimarySelect = (categoryId: string) => {
    setSelectedPrimary(categoryId);
    // Remove from additional if it was there
    setSelectedAdditional((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleAdditionalToggle = (categoryId: string) => {
    if (categoryId === selectedPrimary) {
      return; // Can't add primary to additional
    }

    setSelectedAdditional((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 5) {
          return prev; // Max 5 additional
        }
        return [...prev, categoryId];
      }
    });
  };

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      console.log("[Step 3] Categories data:", data);

      updateCategories(data);
      markStepComplete(3);
      nextStep();
    } catch (error) {
      console.error("[Step 3] Error:", error);
    }
  };

  // Filter categories based on search
  const filteredCategories = allCategories.filter((category) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.children.some((child) =>
        child.name.toLowerCase().includes(query)
      )
    );
  });

  // Get all categories (flatten hierarchy for display)
  const getAllCategoryOptions = (): CategoryOption[] => {
    const options: CategoryOption[] = [];
    filteredCategories.forEach((parent) => {
      options.push(parent);
      if (parent.children.length > 0) {
        options.push(...parent.children);
      }
    });
    return options;
  };

  const allOptions = getAllCategoryOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Categories"
        description="Help customers find your business by selecting relevant categories"
        step={3}
      >
        {/* Search */}
        <FormSection title="Search Categories">
          <FormField label="Search" hint="Search by category name or keywords">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g., Restaurant, Salon, Plumber..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </FormField>
        </FormSection>

        {/* Primary Category */}
        <FormSection title="Primary Category">
          <p className="text-sm text-muted-foreground mb-4">
            Select the main category that best describes your business
          </p>

          {errors.primaryCategoryId && (
            <p className="text-sm text-destructive mb-4">
              {errors.primaryCategoryId.message}
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allOptions.map((category) => {
                const isSelected = selectedPrimary === category.id;
                const isParent = !category.parentId;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handlePrimarySelect(category.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                      !isParent && "pl-8"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {category.icon ? (
                        <span className="text-xl">{category.icon}</span>
                      ) : (
                        <Tag className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!isParent && (
                          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        <h4
                          className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {category.name}
                        </h4>
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Check */}
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </FormSection>

        {/* Additional Categories */}
        {selectedPrimary && (
          <FormSection title="Additional Categories (Optional)">
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 5 additional categories (selected:{" "}
              {selectedAdditional.length}/5)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allOptions
                .filter((cat) => cat.id !== selectedPrimary)
                .map((category) => {
                  const isSelected = selectedAdditional.includes(category.id);
                  const isDisabled =
                    selectedAdditional.length >= 5 && !isSelected;
                  const isParent = !category.parentId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleAdditionalToggle(category.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                        isDisabled && "opacity-50 cursor-not-allowed",
                        !isParent && "pl-6"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {category.icon ? (
                          <span>{category.icon}</span>
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!isParent && (
                            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                          <h4 className="font-medium text-sm text-foreground">
                            {category.name}
                          </h4>
                        </div>
                      </div>

                      {/* Check */}
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Selected badges */}
            {selectedAdditional.length > 0 && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Selected:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAdditional.map((categoryId) => {
                    const category = allOptions.find(
                      (c) => c.id === categoryId
                    );
                    if (!category) return null;

                    return (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="gap-1"
                      >
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                        <button
                          type="button"
                          onClick={() => handleAdditionalToggle(categoryId)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </FormSection>
        )}
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!isValid}
      />
    </form>
  );
}

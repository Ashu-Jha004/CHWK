// components/business-onboarding/steps/step3-categories.tsx
// Step 3: Category selection with search and pagination - Production Ready

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Check, Tag, ChevronRight, Loader2, AlertCircle } from "lucide-react";
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
import { toast } from "sonner";

const INITIAL_DISPLAY_LIMIT = 30;
const LOAD_MORE_INCREMENT = 30;

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
  const [primarySearchQuery, setPrimarySearchQuery] = useState("");
  const [additionalSearchQuery, setAdditionalSearchQuery] = useState("");
  const [primaryDisplayLimit, setPrimaryDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);
  const [additionalDisplayLimit, setAdditionalDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);

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
        toast.success("Categories loaded successfully!");
      } catch (error) {
        console.error("[Categories] Error:", error);
        toast.error("Failed to load categories. Please refresh the page.");
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

  // Get all category options (flatten hierarchy)
  const getAllCategoryOptions = useCallback((): CategoryOption[] => {
    const options: CategoryOption[] = [];
    allCategories.forEach((parent) => {
      options.push(parent);
      if (parent.children.length > 0) {
        options.push(...parent.children);
      }
    });
    return options;
  }, [allCategories]);

  const allOptions = useMemo(() => getAllCategoryOptions(), [getAllCategoryOptions]);

  // Filter and paginate primary categories
  const filteredPrimaryCategories = useMemo(() => {
    if (!primarySearchQuery) return allOptions;

    const query = primarySearchQuery.toLowerCase();
    return allOptions.filter((category) =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  }, [allOptions, primarySearchQuery]);

  const displayedPrimaryCategories = useMemo(() => {
    return filteredPrimaryCategories.slice(0, primaryDisplayLimit);
  }, [filteredPrimaryCategories, primaryDisplayLimit]);

  // Filter and paginate additional categories
  const filteredAdditionalCategories = useMemo(() => {
    const availableCategories = allOptions.filter((cat) => cat.id !== selectedPrimary);

    if (!additionalSearchQuery) return availableCategories;

    const query = additionalSearchQuery.toLowerCase();
    return availableCategories.filter((category) =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  }, [allOptions, selectedPrimary, additionalSearchQuery]);

  const displayedAdditionalCategories = useMemo(() => {
    return filteredAdditionalCategories.slice(0, additionalDisplayLimit);
  }, [filteredAdditionalCategories, additionalDisplayLimit]);

  const handlePrimarySelect = useCallback((categoryId: string) => {
    setSelectedPrimary(categoryId);
    // Remove from additional if it was there
    setSelectedAdditional((prev) => prev.filter((id) => id !== categoryId));
    toast.success("Primary category selected!");
  }, []);

  const handleAdditionalToggle = useCallback((categoryId: string) => {
    if (categoryId === selectedPrimary) {
      return; // Can't add primary to additional
    }

    setSelectedAdditional((prev) => {
      if (prev.includes(categoryId)) {
        toast.info("Category removed");
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 5) {
          toast.error("Maximum 5 additional categories allowed");
          return prev;
        }
        toast.success("Additional category added!");
        return [...prev, categoryId];
      }
    });
  }, [selectedPrimary]);

  const handleLoadMorePrimary = useCallback(() => {
    setPrimaryDisplayLimit((prev) => prev + LOAD_MORE_INCREMENT);
  }, []);

  const handleLoadMoreAdditional = useCallback(() => {
    setAdditionalDisplayLimit((prev) => prev + LOAD_MORE_INCREMENT);
  }, []);

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      console.log("[Step 3] Categories data:", data);

      updateCategories(data);
      markStepComplete(3);
      toast.success("Categories saved! Moving to next step...");
      nextStep();
    } catch (error) {
      console.error("[Step 3] Error:", error);
      toast.error("Failed to save categories. Please try again.");
    }
  };

  const hasMorePrimary = filteredPrimaryCategories.length > primaryDisplayLimit;
  const hasMoreAdditional = filteredAdditionalCategories.length > additionalDisplayLimit;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Categories"
        description="Help customers find your business by selecting relevant categories"
        step={3}
      >
        {/* Primary Category */}
        <FormSection title="Primary Category">
          <p className="text-sm text-muted-foreground mb-4">
            Select the main category that best describes your business
          </p>

          {/* Primary Search */}
          <FormField label="Search Primary Category" hint="Search by category name or keywords">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g., Restaurant, Salon, Plumber..."
                value={primarySearchQuery}
                onChange={(e) => setPrimarySearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </FormField>

          {errors.primaryCategoryId && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                {errors.primaryCategoryId.message}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            </div>
          ) : displayedPrimaryCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No categories found. Try a different search term.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedPrimaryCategories.map((category) => {
                  const isSelected = selectedPrimary === category.id;
                  const isParent = !category.parentId;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handlePrimarySelect(category.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left group",
                        isSelected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-amber-500/10 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md",
                        !isParent && "pl-8"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all",
                          isSelected
                            ? "bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
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

              {/* Load More Button for Primary */}
              {hasMorePrimary && (
                <div className="flex justify-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMorePrimary}
                    className="gap-2"
                  >
                    Load More ({filteredPrimaryCategories.length - primaryDisplayLimit} remaining)
                  </Button>
                </div>
              )}

              {/* Results Info */}
              <p className="text-xs text-muted-foreground text-center">
                Showing {displayedPrimaryCategories.length} of {filteredPrimaryCategories.length} categories
              </p>
            </>
          )}
        </FormSection>

        {/* Additional Categories */}
        {selectedPrimary && (
          <FormSection title="Additional Categories (Optional)">
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 5 additional categories (selected:{" "}
              <span className="font-semibold text-primary">{selectedAdditional.length}/5</span>)
            </p>

            {/* Additional Search */}
            <FormField label="Search Additional Categories" hint="Narrow down your options">
              <div className=" relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search additional categories..."
                  value={additionalSearchQuery}
                  onChange={(e) => setAdditionalSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>

            {displayedAdditionalCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No additional categories found
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedAdditionalCategories.map((category) => {
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
                          "flex items-start gap-2 p-3 rounded-lg border transition-all text-left group",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                          isDisabled && "opacity-40 cursor-not-allowed",
                          !isParent && "pl-6"
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-sm transition-all",
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10"
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
                            <h4 className="font-medium text-sm text-foreground truncate">
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

                {/* Load More Button for Additional */}
                {hasMoreAdditional && (
                  <div className="flex justify-center pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLoadMoreAdditional}
                      className="gap-2"
                    >
                      Load More ({filteredAdditionalCategories.length - additionalDisplayLimit} remaining)
                    </Button>
                  </div>
                )}

                {/* Results Info */}
                <p className="text-xs text-muted-foreground text-center">
                  Showing {displayedAdditionalCategories.length} of {filteredAdditionalCategories.length} categories
                </p>
              </>
            )}

            {/* Selected badges */}
            {selectedAdditional.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Selected Additional Categories:
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
                        className="gap-1.5 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      >
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                        <button
                          type="button"
                          onClick={() => handleAdditionalToggle(categoryId)}
                          className="ml-1 hover:text-destructive rounded-full p-0.5 hover:bg-destructive/10 transition-colors"
                          aria-label={`Remove ${category.name}`}
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

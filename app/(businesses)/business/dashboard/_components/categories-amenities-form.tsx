// app/business/dashboard/_components/categories-amenities-form.tsx
"use client";

import { useState } from "react";
import {
  Business,
  BusinessCategory,
  BusinessAmenity,
  Category,
  Amenity,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  Search,
  Tag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  useUpdateCategories,
  useUpdateAmenities,
  useCategories,
  useAmenities,
} from "@/hooks/business-dashboard/use-business-categories";
import { cn } from "@/lib/utils";

interface CategoriesAmenitiesFormProps {
  business: Business & {
    categories?: (BusinessCategory & {
      category: Category;
    })[];
    amenities?: (BusinessAmenity & {
      amenity: Amenity;
    })[];
  };
}

export function CategoriesAmenitiesForm({
  business,
}: CategoriesAmenitiesFormProps) {
  const updateCategoriesMutation = useUpdateCategories(business.id);
  const updateAmenitiesMutation = useUpdateAmenities(business.id);

  // Fetch all available categories and amenities
  const { data: allCategories, isLoading: categoriesLoading } = useCategories();
  const { data: allAmenities, isLoading: amenitiesLoading } = useAmenities();

  // Local state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    business.categories?.map((bc) => bc.categoryId) || []
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>(
    business.categories?.find((bc) => bc.isPrimary)?.categoryId || ""
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    business.amenities?.map((ba) => ba.amenityId) || []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [amenitySearch, setAmenitySearch] = useState("");

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      // Auto-update primary category if current primary is removed
      if (
        !newCategories.includes(primaryCategoryId) &&
        newCategories.length > 0
      ) {
        setPrimaryCategoryId(newCategories[0]);
      }

      return newCategories;
    });
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  const handleSaveCategories = () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    updateCategoriesMutation.mutate({
      categoryIds: selectedCategories,
      primaryCategoryId,
    });
  };

  const handleSaveAmenities = () => {
    updateAmenitiesMutation.mutate(selectedAmenities);
  };

  const filteredCategories = allCategories?.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredAmenities = allAmenities?.filter((amenity) =>
    amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
  );

  // Group amenities by category with proper typing
  const amenitiesByCategory: Record<string, Amenity[]> =
    filteredAmenities?.reduce(
      (acc: Record<string, Amenity[]>, amenity: Amenity) => {
        const category = amenity.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(amenity);
        return acc;
      },
      {}
    ) || {};

  const isCategoriesDirty =
    JSON.stringify(selectedCategories.sort()) !==
      JSON.stringify(
        (business.categories || []).map((bc) => bc.categoryId).sort()
      ) ||
    primaryCategoryId !==
      (business.categories || []).find((bc) => bc.isPrimary)?.categoryId;

  const isAmenitiesDirty =
    JSON.stringify(selectedAmenities.sort()) !==
    JSON.stringify((business.amenities || []).map((ba) => ba.amenityId).sort());

  return (
    <div className="w-full max-w-full space-y-8">
      {/* Categories Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Business Categories</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select categories that best describe your business. Choose one as
              primary.
            </p>
          </div>

          <Button
            onClick={handleSaveCategories}
            disabled={updateCategoriesMutation.isPending || !isCategoriesDirty}
            className="gap-2"
          >
            {updateCategoriesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Categories
              </>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCategories?.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md",
                    selectedCategories.includes(category.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      className="mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span className="text-lg">{category.icon}</span>
                        )}
                        <h4 className="font-medium text-sm truncate">
                          {category.name}
                        </h4>
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedCategories.includes(category.id) && (
                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>

            {/* Primary Category Selection */}
            {selectedCategories.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Select Primary Category
                </h4>
                <RadioGroup
                  value={primaryCategoryId}
                  onValueChange={setPrimaryCategoryId}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = allCategories?.find(
                        (c) => c.id === categoryId
                      );
                      return (
                        <div
                          key={categoryId}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={categoryId} id={categoryId} />
                          <Label
                            htmlFor={categoryId}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            {category?.icon && <span>{category.icon}</span>}
                            {category?.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amenities Section */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Amenities & Features</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select all amenities and features available at your business
            </p>
          </div>

          <Button
            onClick={handleSaveAmenities}
            disabled={updateAmenitiesMutation.isPending || !isAmenitiesDirty}
            className="gap-2"
          >
            {updateAmenitiesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Amenities
              </>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search amenities..."
            value={amenitySearch}
            onChange={(e) => setAmenitySearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Amenities by Category */}
        {amenitiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(amenitiesByCategory).map(
              ([category, amenities]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md",
                          selectedAmenities.includes(amenity.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleAmenityToggle(amenity.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={() =>
                              handleAmenityToggle(amenity.id)
                            }
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            {amenity.icon && (
                              <span className="text-base">{amenity.icon}</span>
                            )}
                            <span className="text-sm font-medium truncate">
                              {amenity.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

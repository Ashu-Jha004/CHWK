"use client";

import {
  useState,
  useCallback,
  useMemo,
  type ComponentType,
  type SVGProps,
} from "react";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import { CATEGORIES } from "@/lib/(landing_page)/constants";
import { cn, formatNumber } from "@/lib/utils";
import { ChevronRight, ArrowRight } from "lucide-react";
import { uiSelectors } from "@/store/landing_page/ui-store";

type Category = {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
};

/**
 * Categories Section Component
 * Displays all business categories in an interactive grid
 */
export function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { setActive } = uiSelectors.useCategory();

  // Handle category click
  const handleCategoryClick = useCallback(
    (category: Category) => {
      try {
        setActive(category.id);
        console.log("Category selected:", category.name);
        // TODO: Navigate to category page
        // router.push(`/categories/${category.id}`);
      } catch (error) {
        console.error("Category selection error:", error);
      }
    },
    [setActive]
  );

  // Split categories into rows for better layout
  const categoriesGrid = useMemo(() => CATEGORIES as Category[], []);

  return (
    <SectionWrapper id="categories" background="white">
      <SectionHeader
        badge="Explore"
        title="Browse by Category"
        description="Find the perfect local business across our wide range of categories"
        align="center"
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        {categoriesGrid.map((category, index) => {
          const IconComponent = category.icon;
          const isHovered = hoveredCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={cn(
                "group relative bg-white rounded-2xl p-6 border-2 border-gray-100",
                "hover:border-transparent hover:shadow-2xl",
                "transition-all duration-300 ease-out",
                "text-left overflow-hidden",
                "animate-fade-in-up focus-visible-ring"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Color on Hover */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                  category.color
                )}
              />

              {/* Icon Container */}
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                  "transition-all duration-300 group-hover:scale-110",
                  isHovered ? category.color : "bg-gray-100",
                  isHovered && "text-white"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-7 h-7 transition-colors",
                    isHovered ? "text-white" : "text-gray-600"
                  )}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-gray-900">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>

                {/* Business Count */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {formatNumber(category.count)} listings
                  </span>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-all",
                      "group-hover:text-primary group-hover:translate-x-1"
                    )}
                  />
                </div>
              </div>

              {/* Hover Indicator Line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  category.color
                )}
              />
            </button>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button size="lg" variant="outline" className="gap-2 group">
          View All Categories
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </SectionWrapper>
  );
}

// components/categories/category-grid.tsx
'use client';

import { memo } from 'react';
import CategoryCard from './category-card';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number | null;
  description: string | null;
}

interface CategoryGridProps {
  categories: Category[];
}

/**
 * CategoryGrid Component
 * Responsive masonry-style grid layout for categories
 * Mobile: 2 columns, Tablet: 3 columns, Desktop: 4-5 columns
 */
const CategoryGrid = memo(({ categories }: CategoryGridProps) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No categories available</p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Please check back later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-scale-in">
      {/* Grid with responsive columns */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
          />
        ))}
      </div>

      {/* Category count */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
        </p>
      </div>
    </div>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;

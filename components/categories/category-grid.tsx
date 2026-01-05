// components/categories/category-grid.tsx
'use client';

import { memo, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const lowerTerm = searchTerm.toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(lowerTerm)
    );
  }, [categories, searchTerm]);

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
    <div className="space-y-8 animate-scale-in">
      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Grid with responsive columns */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
           No categories found for "{searchTerm}"
        </div>
      )}

      {/* Category count */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
        </p>
      </div>
    </div>
  );
});

CategoryGrid.displayName = 'CategoryGrid';

export default CategoryGrid;

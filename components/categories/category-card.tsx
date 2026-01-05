// components/categories/category-card.tsx
'use client';

import Link from 'next/link';
import { useCallback, memo } from 'react';

/**
 * Category type matching API response
 */
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number | null;
  description: string | null;
}

interface CategoryCardProps {
  category: Category;
  index?: number;
}

/**
 * Default icons for categories without custom icons
 * Using emoji for lightweight, accessible icons
 */
const DEFAULT_ICONS: Record<string, string> = {
  restaurants: '🍽️',
  food: '🍔',
  cafe: '☕',
  hotel: '🏨',
  gym: '💪',
  spa: '🧖',
  salon: '💇',
  shopping: '🛍️',
  medical: '🏥',
  education: '📚',
  automotive: '🚗',
  services: '🔧',
  entertainment: '🎭',
  sports: '⚽',
  travel: '✈️',
  default: '🏪',
};

/**
 * Get icon for category - uses custom icon or falls back to default
 */
const getCategoryIcon = (category: Category): string => {
  if (category.icon) return category.icon;

  const slug = category.slug.toLowerCase();

  // Try to match slug with default icons
  for (const [key, icon] of Object.entries(DEFAULT_ICONS)) {
    if (slug.includes(key)) return icon;
  }

  return DEFAULT_ICONS.default;
};

/**
 * CategoryCard Component
 * Displays a single category with icon and name
 * Navigates to category discovery page on click
 */
const CategoryCard = memo(({ category, index = 0 }: CategoryCardProps) => {
  const icon = getCategoryIcon(category);

  // Prefetch on hover for better UX
  const handleMouseEnter = useCallback(() => {
    // Next.js will automatically prefetch the link on hover
  }, []);

  return (
    <Link
      href={`/categories/${category.slug}`}
      onMouseEnter={handleMouseEnter}
      className="group relative block"
      aria-label={`Explore ${category.name}`}
    >
      <div
        className="card-hover glass relative overflow-hidden rounded-lg border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
        style={{
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            <span role="img" aria-label={`${category.name} icon`}>
              {icon}
            </span>
          </div>

          {/* Category Name */}
          <h3 className="font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
            {category.name}
          </h3>

          {/* Description (if available) */}
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Hover indicator */}
          <div className="h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-12" />
        </div>
      </div>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;

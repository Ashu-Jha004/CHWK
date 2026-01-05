// components/discovery/sort-filter.tsx
'use client';

import { memo } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortFilterProps {
  sortBy: 'distance' | 'rating' | 'reviews';
  onChange: (sortBy: 'distance' | 'rating' | 'reviews') => void;
  disabled?: boolean;
}

const SORT_OPTIONS = [
  { value: 'distance' as const, label: 'Nearest First' },
  { value: 'rating' as const, label: 'Highest Rated' },
  { value: 'reviews' as const, label: 'Most Reviewed' },
];

/**
 * Sort Filter Component
 * Allows users to sort businesses
 */
const SortFilter = memo(({ sortBy, onChange, disabled = false }: SortFilterProps) => {
  return (
    <div className="glass rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowUpDown className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Sort By</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              sortBy === option.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
});

SortFilter.displayName = 'SortFilter';

export default SortFilter;

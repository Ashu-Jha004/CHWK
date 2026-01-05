'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
// Removed unused prop imports
import { MapPin, Star, ArrowUpDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterTabsProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  sortBy: 'distance' | 'rating' | 'reviews';
  onSortChange: (sortBy: 'distance' | 'rating' | 'reviews') => void;
  disabled?: boolean;
}

const FilterTabs = memo(({ radius, onRadiusChange, sortBy, onSortChange, disabled }: FilterTabsProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {/* Radius Tab/Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={radius ? "default" : "outline"}
            size="sm"
            className={cn("gap-2 h-9 rounded-full", radius ? "bg-primary text-primary-foreground" : "bg-card")}
            disabled={disabled}
          >
            <MapPin className="w-4 h-4" />
            <span>Within {radius}km</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] p-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground px-2 py-1">Select Radius</span>
            {[10, 20, 50].map((r) => (
               <DropdownMenuItem
                 key={r}
                 onClick={() => onRadiusChange(r)}
                 className={cn("cursor-pointer", radius === r && "bg-primary/10 text-primary")}
               >
                 <span>{r} km</span>
                 {radius === r && <span className="ml-auto text-xs font-bold">✓</span>}
               </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-[1px] h-6 bg-border mx-2" />

      {/* Sort Tabs */}
      <Button
        variant={sortBy === 'distance' ? "secondary" : "ghost"}
        size="sm"
        className={cn("gap-2 h-9 rounded-full", sortBy === 'distance' && "bg-secondary/10 text-secondary hover:bg-secondary/20")}
        onClick={() => onSortChange('distance')}
        disabled={disabled}
      >
        <ArrowUpDown className="w-4 h-4" />
        Nearest
      </Button>

      <Button
        variant={sortBy === 'rating' ? "secondary" : "ghost"}
        size="sm"
        className={cn("gap-2 h-9 rounded-full", sortBy === 'rating' && "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20")}
        onClick={() => onSortChange('rating')}
        disabled={disabled}
      >
        <Star className="w-4 h-4" />
        Top Rated
      </Button>

      <Button
        variant={sortBy === 'reviews' ? "secondary" : "ghost"}
        size="sm"
        className={cn("gap-2 h-9 rounded-full", sortBy === 'reviews' && "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20")}
        onClick={() => onSortChange('reviews')}
        disabled={disabled}
      >
         <MessageSquare className="w-4 h-4" />
        Most Reviewed
      </Button>
    </div>
  );
});

FilterTabs.displayName = 'FilterTabs';

export default FilterTabs;

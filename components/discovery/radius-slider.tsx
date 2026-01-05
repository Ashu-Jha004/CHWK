// components/discovery/radius-slider.tsx
'use client';

import { memo } from 'react';
import { MapPin } from 'lucide-react';

interface RadiusSliderProps {
  radius: number;
  onChange: (radius: number) => void;
  disabled?: boolean;
}

const RADIUS_OPTIONS = [10, 20, 50];

/**
 * Radius Slider Component
 * Allows users to adjust search radius (10km, 20km, 50km)
 */
const RadiusSlider = memo(({ radius, onChange, disabled = false }: RadiusSliderProps) => {
  return (
    <div className="glass rounded-lg border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Search Radius</span>
      </div>

      <div className="flex gap-2">
        {RADIUS_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              radius === option
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {option}km
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-center">
        Showing businesses within {radius}km of your location
      </p>
    </div>
  );
});

RadiusSlider.displayName = 'RadiusSlider';

export default RadiusSlider;

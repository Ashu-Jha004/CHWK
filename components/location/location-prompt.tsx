// components/location/location-prompt.tsx
'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, RefreshCw } from 'lucide-react';

interface LocationPromptProps {
  error?: string | null;
  permissionDenied?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

/**
 * Location prompt component
 * Shows when location permission is needed or failed
 */
export default function LocationPrompt({
  error,
  permissionDenied,
  isLoading,
  onRetry,
}: LocationPromptProps) {
  return (
    <div className="glass rounded-lg border border-border/50 bg-card p-6 shadow-lg md:p-8">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {error ? (
            <AlertCircle className="h-8 w-8 text-destructive" />
          ) : (
            <MapPin className="h-8 w-8 text-primary" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground md:text-2xl">
          {error ? 'Location Error' : 'Enable Location Access'}
        </h3>

        {/* Description */}
        <p className="mt-3 max-w-md text-muted-foreground">
          {error ? (
            error
          ) : permissionDenied ? (
            <>
              Location permission was denied. We&apos;re using your approximate location
              based on your IP address. For better results, please enable location
              access in your browser settings.
            </>
          ) : (
            <>
              To show you nearby businesses within 20km, we need access to your
              location. Your location data is only used for search and is never stored.
            </>
          )}
        </p>

        {/* Action Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isLoading}
            size="lg"
            className="btn-shine mt-6"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Detecting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                {error ? 'Try Again' : 'Enable Location'}
              </>
            )}
          </Button>
        )}

        {/* Help Text */}
        {permissionDenied && (
          <p className="mt-4 text-xs text-muted-foreground">
            Using IP-based location. Accuracy: ~5-50km radius
          </p>
        )}
      </div>
    </div>
  );
}

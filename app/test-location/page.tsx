'use client';

import { useLocation } from '@/hooks/use-location';
import LocationPrompt from '@/components/location/location-prompt';

export default function TestLocationPage() {
  const { location, isLoading, error, permissionDenied, refetch } = useLocation();

  if (isLoading) {
    return (
      <div className="container-padding section-spacing">
        <p>Loading location...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="container-padding section-spacing max-w-2xl mx-auto">
        <LocationPrompt
          error={error}
          permissionDenied={permissionDenied}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container-padding section-spacing">
      <h1 className="text-2xl font-bold">Location Test</h1>
      <div className="mt-4 rounded-lg bg-muted p-4">
        <pre>{JSON.stringify(location, null, 2)}</pre>
      </div>
    </div>
  );
}

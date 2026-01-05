// app/categories/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for categories page
 * Catches and displays errors gracefully
 */
export default function CategoriesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('[Categories Page] Error Boundary:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <section className="section-spacing">
        <div className="container-padding mx-auto max-w-2xl">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-4xl">
              ⚠️
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Oops! Something went wrong
            </h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t load the categories. Please try again.
            </p>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                <p className="font-mono text-sm text-destructive">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={reset}
                size="lg"
                className="btn-shine"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

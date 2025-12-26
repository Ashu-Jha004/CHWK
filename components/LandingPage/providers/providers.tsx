"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useCallback } from "react";

/**
 * Global Providers Component
 * Wraps the app with React Query and other providers
 * Includes error handling and performance optimizations
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with optimized configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry configuration
            retry: (failureCount, error) => {
              // Don't retry on 404s
              if (error instanceof Error && error.message.includes("404")) {
                return false;
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Error handling
            throwOnError: false,
          },
          mutations: {
            // Global mutation error handler
            onError: (error) => {
              console.error("Mutation error:", error);
              // You can add toast notifications here later
            },
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  // Global error boundary fallback
  const handleError = useCallback((error: Error) => {
    console.error("Provider error boundary caught:", error);
    // Log to error tracking service (e.g., Sentry) in production
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

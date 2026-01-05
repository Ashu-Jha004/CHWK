"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import Link from "next/link";

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
          <div className="mx-auto max-w-md space-y-6">
            <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">
              500
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Something went wrong!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                We apologize for the inconvenience. A critical error occurred.
                Please try refreshing the page or contact support if the problem
                persists.
              </p>
              {error.digest && (
                <p className="text-xs text-mono text-gray-400">
                  Ref: {error.digest}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={
                  // Attempt to recover by trying to re-render the segment
                  () => reset()
                }
              >
                Try again
              </Button>
              <Link href="/" passHref>
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

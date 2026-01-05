"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Oops! something went wrong
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            We encountered an unexpected error while processing your request.
          </p>
          {error.digest && (
            <p className="text-xs text-mono text-gray-400">
              Error ID: {error.digest}
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
            Try Again
          </Button>
           <Link href="/" passHref>
             <Button variant="ghost">Go Home</Button>
           </Link>
        </div>
      </div>
    </div>
  );
}

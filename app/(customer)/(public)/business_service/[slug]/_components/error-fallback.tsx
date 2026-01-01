// app/business_service/[slug]/_components/error-fallback.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  message = "We encountered an error. Please try again.",
}: ErrorFallbackProps) {
  const router = useRouter();

  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      router.refresh();
    }
  };

  return (
    <Card className="p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{message}</p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-left bg-muted p-4 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Error Details
            </summary>
            <pre className="text-xs overflow-auto text-destructive">
              {error.message}
            </pre>
          </details>
        )}
      </div>

      <Button onClick={handleReset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </Card>
  );
}

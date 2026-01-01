// app/business_service/[slug]/error.tsx

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, Search, Trash2 } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BusinessDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Structured error logging
    const errorLog = {
      level: "error",
      context: "BusinessDetailPage",
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    console.error("[BusinessDetailError]", JSON.stringify(errorLog, null, 2));

    // Note: In production, this would be sent to Sentry/LogRocket
  }, [error]);

  const handleClearCache = () => {
    // Hard reload to clear client-side cache
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
            <div className="relative bg-destructive/10 p-6 rounded-full">
              <AlertCircle className="h-20 w-20 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error while loading this business page.
            Don&apos;t worry, we&apos;re working on it!
          </p>

          {/* Error Details (Available for debugging) */}
          <details className="mt-6 text-left bg-muted/50 p-4 rounded-lg max-w-lg mx-auto">
            <summary className="cursor-pointer font-semibold text-sm mb-2 text-muted-foreground hover:text-foreground transition-colors">
              View Error Details
            </summary>
            {/* Warning about sensitivity */}
            <p className="text-[10px] text-muted-foreground mb-2">
              Please share this with support if the issue persists.
            </p>
            <pre className="text-xs overflow-auto text-destructive max-h-40 whitespace-pre-wrap break-words p-2 border border-destructive/20 rounded bg-background">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            {error.stack && (
               <pre className="text-[10px] text-muted-foreground mt-2 overflow-x-auto">
                 {error.stack}
               </pre>
            )}
          </details>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button
            onClick={handleClearCache}
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search Businesses
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

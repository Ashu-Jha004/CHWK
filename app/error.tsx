"use client";

import { ErrorMessage } from "@/components/ui/error-message";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorMessage
        title="Something went wrong"
        message={error.message || "An unexpected error occurred"}
        onRetry={reset}
      />
    </div>
  );
}

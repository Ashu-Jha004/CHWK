// app/business/dashboard/_components/no-business.tsx
"use client";

import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoBusiness() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-md w-full animate-scale-in">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold mb-3">No Business Found</h1>

        <p className="text-muted-foreground mb-8">
          You haven&apos;t registered your business yet. Let&apos;s get you
          started with creating your business profile.
        </p>

        <Button
          size="lg"
          onClick={() => router.push("/business/onboarding")}
          className="gap-2 w-full btn-shine"
        >
          Create Your Business
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          Already have a business?{" "}
          <button
            onClick={() => router.refresh()}
            className="text-primary hover:underline font-medium"
          >
            Refresh page
          </button>
        </p>
      </div>
    </div>
  );
}

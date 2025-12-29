// app/business/dashboard/_components/invalid-role.tsx
"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvalidRoleProps {
  message: string;
}

export function InvalidRole({ message }: InvalidRoleProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-md w-full animate-scale-in">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10">
          <ShieldAlert className="h-10 w-10 text-yellow-500" />
        </div>

        <h1 className="text-3xl font-bold mb-3">Access Restricted</h1>

        <p className="text-muted-foreground mb-8">{message}</p>

        <Button
          size="lg"
          onClick={() => router.push("/")}
          className="gap-2 w-full"
        >
          <Home className="h-4 w-4" />
          Go to Homepage
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          Need to register as a business owner?{" "}
          <button
            onClick={() => router.push("/business/onboarding")}
            className="text-primary hover:underline font-medium"
          >
            Get started
          </button>
        </p>
      </div>
    </div>
  );
}

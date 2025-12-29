// app/business/dashboard/_components/business-suspended.tsx
"use client";

import { AlertTriangle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business } from "@prisma/client";

interface BusinessSuspendedProps {
  business: Business;
  message: string;
}

export function BusinessSuspended({
  business,
  message,
}: BusinessSuspendedProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-lg w-full animate-scale-in">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Business {business.status === "SUSPENDED" ? "Suspended" : "Closed"}
        </h1>

        <p className="text-muted-foreground mb-2">{message}</p>

        {business.status === "SUSPENDED" && (
          <p className="text-sm text-muted-foreground mb-8">
            Your business access has been temporarily suspended. Please contact
            our support team for assistance.
          </p>
        )}

        {business.status === "CLOSED" && (
          <p className="text-sm text-muted-foreground mb-8">
            This business has been marked as closed. If you believe this is a
            mistake, please contact support.
          </p>
        )}

        <div className="space-y-3">
          <Button
            size="lg"
            variant="default"
            className="gap-2 w-full"
            onClick={() =>
              (window.location.href = "mailto:support@yourdomain.com")
            }
          >
            <Mail className="h-4 w-4" />
            Email Support
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="gap-2 w-full"
            onClick={() => (window.location.href = "tel:+911234567890")}
          >
            <Phone className="h-4 w-4" />
            Call Support
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Business:</strong> {business.name}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Status:</strong> {business.status}
          </p>
        </div>
      </div>
    </div>
  );
}

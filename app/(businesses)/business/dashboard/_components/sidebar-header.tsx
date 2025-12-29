// app/business/dashboard/_components/sidebar-header.tsx
"use client";

import { Building2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/business-dashboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface SidebarHeaderProps {
  businessName: string;
  businessLogo?: string | null;
}

export function SidebarHeader({
  businessName,
  businessLogo,
}: SidebarHeaderProps) {
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-4">
      {/* Business Info */}
      <div
        className={cn(
          "flex items-center gap-3 overflow-hidden transition-all duration-200",
          !sidebarOpen && "w-0 opacity-0"
        )}
      >
        <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
          <AvatarImage src={businessLogo || undefined} alt={businessName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {businessLogo ? (
              <Building2 className="h-5 w-5" />
            ) : (
              getInitials(businessName)
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 overflow-hidden">
          <h2 className="truncate text-sm font-semibold">{businessName}</h2>
          <p className="truncate text-xs text-muted-foreground">
            Business Dashboard
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "h-8 w-8 shrink-0 transition-transform duration-200",
          !sidebarOpen && "rotate-180"
        )}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

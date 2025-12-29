// app/business/dashboard/_components/mobile-header.tsx
"use client";

import { Menu, RefreshCw } from "lucide-react";
import { useDashboardStore } from "@/store/business-dashboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface MobileHeaderProps {
  businessName: string;
  businessLogo?: string | null;
  onRefresh?: () => void;
}

export function MobileHeader({
  businessName,
  businessLogo,
  onRefresh,
}: MobileHeaderProps) {
  const { setSidebarOpen } = useDashboardStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
      {/* Left: Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center: Business Name */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={businessLogo || undefined} alt={businessName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {getInitials(businessName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-sm font-semibold truncate max-w-[150px]">
          {businessName}
        </h1>
      </div>

      {/* Right: Refresh Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        aria-label="Refresh"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </header>
  );
}

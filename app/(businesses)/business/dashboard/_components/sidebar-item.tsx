// app/business/dashboard/_components/sidebar-item.tsx
"use client";

import { useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStore, DashboardTab } from "@/store/business-dashboard";

interface SidebarItemProps {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: boolean;
  badgeCount?: number;
  onClick?: () => void;
}

export function SidebarItem({
  id,
  label,
  icon: Icon,
  description,
  badge,
  badgeCount,
  onClick,
}: SidebarItemProps) {
  const { activeTab, setActiveTab, sidebarOpen, isMobile } =
    useDashboardStore();
  const router = useRouter();

  const isActive = useMemo(() => activeTab === id, [activeTab, id]);

  const handleClick = () => {
    setActiveTab(id);

    // Navigate to the appropriate route
    if (id === "overview") {
      router.push("/business/dashboard");
    } else if (["bookings", "orders", "menu"].includes(id)) {
      router.push(`/business/dashboard/${id}`);
    } else {
      // Default behavior for other tabs that might be handled in DashboardContent
      router.push("/business/dashboard");
    }

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
      title={!sidebarOpen ? label : undefined}
    >
      {/* Icon */}
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-200",
          isActive ? "scale-110" : "group-hover:scale-110"
        )}
      />

      {/* Label - Show only when sidebar is open */}
      {sidebarOpen && (
        <div className="flex flex-1 flex-col items-start overflow-hidden">
          <span className="truncate">{label}</span>
          {!isMobile && (
            <span
              className={cn(
                "truncate text-xs transition-colors",
                isActive
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground/70"
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}

      {/* Badge */}
      {badge && badgeCount !== undefined && badgeCount > 0 && sidebarOpen && (
        <span
          className={cn(
            "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
            isActive
              ? "bg-primary-foreground text-primary"
              : "bg-destructive text-destructive-foreground"
          )}
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}

      {/* Dot indicator when collapsed */}
      {badge && badgeCount !== undefined && badgeCount > 0 && !sidebarOpen && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
      )}

      {/* Active indicator */}
      {isActive && (
        <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary-foreground" />
      )}
    </button>
  );
}

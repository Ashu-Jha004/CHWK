// app/business/dashboard/_components/profile-tabs.tsx
"use client";

import { useDashboardStore, ProfileTab } from "@/store/business-dashboard";
import { cn } from "@/lib/utils";
import {
  Info,
  Clock,
  Camera,
  Tag,
  Settings,
  FileText,
  LucideIcon,
} from "lucide-react";

interface ProfileTabItem {
  id: ProfileTab;
  label: string;
  icon: LucideIcon;
  description: string;
}

const profileTabs: ProfileTabItem[] = [
  {
    id: "basic-info",
    label: "Basic Info",
    icon: Info,
    description: "Business details and contact",
  },
  {
    id: "hours",
    label: "Business Hours",
    icon: Clock,
    description: "Operating schedule",
  },
  {
    id: "photos",
    label: "Photos & Media",
    icon: Camera,
    description: "Logo and gallery",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    description: "Categories and amenities",
  },
  {
    id: "service-settings",
    label: "Service Settings",
    icon: Settings,
    description: "Delivery and bookings",
  },
  {
    id: "legal",
    label: "Legal & Docs",
    icon: FileText,
    description: "GST, PAN, documents",
  },
];

export function ProfileTabs() {
  const { activeProfileTab, setActiveProfileTab } = useDashboardStore();

  return (
    <div className="border-b border-border overflow-x-auto hide-scrollbar">
      <div className="flex gap-1 min-w-max px-4 lg:px-0">
        {profileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeProfileTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                "hover:text-primary hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start">
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-xs hidden lg:block",
                    isActive ? "text-primary/70" : "text-muted-foreground/70"
                  )}
                >
                  {tab.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// app/business/dashboard/_components/sidebar-config.ts
import {
  LayoutDashboard,
  Building2,
  Star,
  Users,
  MessageSquareWarning,
  Settings,
  Calendar,
  Package,
  ShoppingCart,
  LucideIcon,
} from "lucide-react";
import { DashboardTab } from "@/store/business-dashboard";

export interface SidebarItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: boolean; // Show notification badge
}

export const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    id: "profile",
    label: "Business Profile",
    icon: Building2,
    description: "Manage your business details",
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: Calendar,
    description: "Manage appointments",
  },
  {
    id: "menu",
    label: "Menu & Services",
    icon: Package,
    description: "Manage your offerings",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description: "Handle custom orders",
    badge: true,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "View and respond to reviews",
    badge: true,
  },
  {
    id: "staff",
    label: "Staff Management",
    icon: Users,
    description: "Manage your team",
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    description: "Handle customer complaints",
    badge: true,
  },
];

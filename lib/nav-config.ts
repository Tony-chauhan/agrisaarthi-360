import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  Sprout,
  Leaf as ScanLeaf,
  CloudSun,
  Tractor,
  MessageCircleHeart,
  CalendarCheck,
  History,
} from "lucide-react";

/** Central navigation config — single source of truth for sidebar + mobile nav. */

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your farm at a glance",
  },
  {
    label: "Farm Profile",
    href: "/farm-profile",
    icon: ClipboardList,
    description: "Your farm context",
  },
  {
    label: "Crop Advisor",
    href: "/crop-advisor",
    icon: Sprout,
    description: "Choose what to grow",
  },
  {
    label: "Crop Health",
    href: "/crop-health",
    icon: ScanLeaf,
    description: "Check leaf photos",
  },
  {
    label: "Weather",
    href: "/weather",
    icon: CloudSun,
    description: "Weather to farm action",
  },
  {
    label: "Farm Operations",
    href: "/operations",
    icon: Tractor,
    description: "Machinery requests",
  },
  {
    label: "Farm Planner",
    href: "/planner",
    icon: CalendarCheck,
    description: "Today's plan",
  },
  {
    label: "Farm Timeline",
    href: "/timeline",
    icon: History,
    description: "Actions & records",
  },
  {
    label: "AI Assistant",
    href: "/assistant",
    icon: MessageCircleHeart,
    description: "Ask about your farm",
  },
];

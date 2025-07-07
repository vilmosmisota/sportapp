"use client";

import HorizontalNavSublayout, {
  NavItem,
} from "@/composites/sublayout/HorizontalNavSublayout";
import {
  Building2,
  Calendar,
  ClipboardCheck,
  NotebookTabs,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function GlobalSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "General",
      href: "/settings",
      icon: <Building2 className="h-4 w-4" />,
      description: "General organization settings",
    },
    {
      name: "Management",
      href: "/settings/management",
      icon: <NotebookTabs className="h-4 w-4" />,
      description: "Performers and groups configuration",
    },
    {
      name: "Scheduling",
      href: "/settings/scheduling",
      icon: <Calendar className="h-4 w-4" />,
      description: "Session locations and scheduling",
    },
    {
      name: "Attendance",
      href: "/settings/attendance",
      icon: <ClipboardCheck className="h-4 w-4" />,
      description: "Attendance and check-in settings",
    },
  ];

  // Show back button to dashboard if not on /settings
  const backHref = "/";
  const backLabel = "Dashboard";

  return (
    <HorizontalNavSublayout
      navItems={navItems}
      backHref={backHref}
      backLabel={backLabel}
    >
      {children}
    </HorizontalNavSublayout>
  );
}

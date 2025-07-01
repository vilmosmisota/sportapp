"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/libs/tailwind/utils";
import {
  Building2,
  Calendar,
  ClipboardCheck,
  NotebookTabs,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

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

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden relative">
      {/* Vertical Navigation Sidebar */}
      <div className="w-64 absolute top-0 left-0 h-full overflow-y-auto">
        <div className="py-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/settings"
                  ? pathname === "/settings"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium capitalize">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full pl-72 w-full overflow-hidden px-4">
        <ScrollArea className="h-full w-full">
          <div className="py-6 pr-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}

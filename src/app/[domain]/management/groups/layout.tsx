"use client";

import { cn } from "@/libs/tailwind/utils";
import { Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const domain = params.domain as string;

  const baseHref = `/management/groups`;

  const navItems: NavItem[] = [
    {
      name: "Groups",
      href: baseHref,
      icon: <Users className="h-4 w-4" />,
      description: "Manage groups",
    },
    {
      name: "Settings",
      href: `${baseHref}/settings`,
      icon: <Settings className="h-4 w-4" />,
      description: "Configure group settings and preferences",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Horizontal Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 py-4 px-1 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
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
                <span className="capitalize">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}

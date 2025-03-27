"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/libs/tailwind/utils";
import { Building2, Users2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Organization",
      href: "/o/dashboard/settings/organization",
      icon: <Building2 className="h-4 w-4" />,
      description: "Manage organization settings",
    },
    {
      name: "Roles",
      href: "/o/dashboard/settings/roles",
      icon: <ShieldCheck className="h-4 w-4" />,
      description: "Manage roles and permissions",
    },
    {
      name: "Users",
      href: "/o/dashboard/settings/users",
      icon: <Users2 className="h-4 w-4" />,
      description: "Manage users and permissions",
    },
  ];

  // Determine the current section for the header
  const currentSection = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const pageTitle = currentSection
    ? `${currentSection.name} Settings`
    : "Settings";

  const pageDescription = currentSection
    ? currentSection.description
    : "Manage your organization settings and user access";

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader title={pageTitle} description={pageDescription} />

      <div className="bg-muted/40 rounded-lg border mb-6">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-muted-foreground/25 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}

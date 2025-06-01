"use client";

import {
  getTenantPerformerName,
  getTenantPerformerSlug,
} from "@/entities/member/Member.utils";
import { cn } from "@/libs/tailwind/utils";
import {
  CheckCircle,
  Link as LinkIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import { useTenantAndUserAccessContext } from "../../../../../../components/auth/TenantAndUserAccessContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export default function PerformerSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { tenant } = useTenantAndUserAccessContext();

  if (!tenant) {
    return children;
  }

  const domain = params.domain as string;
  const performerSlug = params.performerSlug as string;
  const configSlug = getTenantPerformerSlug(tenant);
  const displayName = getTenantPerformerName(tenant);

  // Only show navigation if the slug is valid
  const isValidSlug = performerSlug === configSlug;
  if (!isValidSlug) {
    return children;
  }

  const baseHref = `/o/dashboard/${performerSlug}`;

  const navItems: NavItem[] = [
    {
      name: displayName,
      href: baseHref,
      icon: <Users className="h-4 w-4" />,
      description: `Manage ${displayName.toLowerCase()}`,
    },
    {
      name: "Verifications",
      href: `${baseHref}/verifications`,
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Manage verification status and documents",
    },
    {
      name: "Connections",
      href: `${baseHref}/connections`,
      icon: <LinkIcon className="h-4 w-4" />,
      description: "Manage relationships and connections",
    },
    {
      name: "Permissions",
      href: `${baseHref}/permissions`,
      icon: <ShieldCheck className="h-4 w-4" />,
      description: "Manage access permissions and roles",
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

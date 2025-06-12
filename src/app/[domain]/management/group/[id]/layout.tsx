"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { useGroupConnections } from "@/entities/group/GroupConnection.query";
import { cn } from "@/libs/tailwind/utils";
import { Calendar, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface GroupLayoutProps {
  children: React.ReactNode;
  params: {
    domain: string;
    id: string;
  };
}

export default function GroupLayout({ children, params }: GroupLayoutProps) {
  const pathname = usePathname();
  const { tenant } = useTenantAndUserAccessContext();
  const tenantId = tenant?.id?.toString() || "";
  const groupId = parseInt(params.id);
  const baseHref = `/management/group/${params.id}`;

  const { data: groupData, isLoading } = useGroupConnections(
    tenantId,
    groupId,
    !!tenantId && !!groupId
  );

  const navItems: NavItem[] = [
    {
      name: "Overview",
      href: baseHref,
      icon: <Users className="h-4 w-4" />,
      description: "Group details and members",
    },
    {
      name: "Events",
      href: `${baseHref}/events`,
      icon: <Calendar className="h-4 w-4" />,
      description: "Group events and activities",
    },
    {
      name: "Parents",
      href: `${baseHref}/parents`,
      icon: <UserCheck className="h-4 w-4" />,
      description: "Parent and guardian information",
    },
  ];

  const groupDisplayName = groupData?.group
    ? createGroupDisplay(
        groupData.group,
        tenant?.tenantConfigs?.groups || undefined
      )
    : null;

  return (
    <div className="w-full">
      {/* Group Name Header */}
      <div className="pb-2">
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : groupDisplayName ? (
          <h1 className="text-2xl font-bold text-foreground">
            {groupDisplayName}
          </h1>
        ) : null}
      </div>

      {/* Horizontal Navigation */}
      <div className="border-b border-border mb-6">
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

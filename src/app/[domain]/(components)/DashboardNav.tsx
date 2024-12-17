"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/libs/tailwind/utils";
import { NavItem } from "./Dashboard";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export default function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4 mt-6">
      {items.map((item) => {
        const isActive =
          item.href === "/o/dashboard"
            ? pathname === "/o/dashboard"
            : pathname.includes(item.href);

        const Icon = Icons[item.iconName as keyof typeof Icons] as LucideIcon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

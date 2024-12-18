"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";

type NavItem = {
  name: string;
  href: string;
  iconName: string;
};

interface DashboardNavProps {
  items: NavItem[];
  icons: Record<string, LucideIcon>;
}

export default function DashboardNav({ items, icons }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item, index) => {
        const Icon = icons[item.iconName];
        return (
          <Link key={index} href={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

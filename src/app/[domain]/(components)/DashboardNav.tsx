"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import iconMap from "./Dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  name: string;
  href: string;
  iconName: keyof typeof iconMap;
};

type NavSection = {
  section: string;
  items: NavItem[];
};

interface DashboardNavProps {
  items: NavSection[];
  icons: Record<string, LucideIcon>;
  className?: string;
  onItemClick?: () => void;
  collapsed?: boolean;
}

export default function DashboardNav({
  items,
  icons,
  className,
  onItemClick,
  collapsed = false,
}: DashboardNavProps) {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, index: number) => {
    const Icon = icons[item.iconName];
    const isActive = pathname === item.href;
    const navItem = (
      <Link
        key={index}
        href={item.href}
        onClick={onItemClick}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          "active:scale-[0.98]"
        )}
      >
        <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
        {!collapsed && (
          <>
            <span>{item.name}</span>
            {isActive && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </>
        )}
      </Link>
    );

    return collapsed ? (
      <TooltipProvider key={index} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right" className="font-normal">
            {item.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      navItem
    );
  };

  return (
    <nav className={cn("grid items-start gap-4", className)}>
      {items.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-2">
          {!collapsed && (
            <h3 className="font-medium text-xs uppercase text-muted-foreground tracking-wider px-4">
              {section.section}
            </h3>
          )}
          <div className="grid gap-1 px-1">
            {section.items.map((item, index) => renderNavItem(item, index))}
          </div>
        </div>
      ))}
    </nav>
  );
}

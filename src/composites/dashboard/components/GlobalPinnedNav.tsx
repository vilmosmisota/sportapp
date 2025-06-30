import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useGlobalPinnedItems } from "../hooks/useGlobalPinnedItems";
import { BaseNavSection } from "../types/baseDashboard.types";
import { getIcon } from "../types/constants";

interface GlobalPinnedNavProps {
  isCollapsed: boolean;
  managementNavSections: BaseNavSection[];
  schedulingNavSections: BaseNavSection[];
  attendanceNavSections: BaseNavSection[];
  membersNavSections: BaseNavSection[];
  pathname: string;
  domain: string;
}

export function GlobalPinnedNav({
  isCollapsed,
  managementNavSections,
  schedulingNavSections,
  attendanceNavSections,
  membersNavSections,
  pathname,
  domain,
}: GlobalPinnedNavProps) {
  const { getPinnedItems } = useGlobalPinnedItems();

  const pinnedItems = getPinnedItems(
    managementNavSections,
    schedulingNavSections,
    attendanceNavSections,
    membersNavSections
  );

  // Only show when sidebar is collapsed and we have pinned items
  if (!isCollapsed || pinnedItems.length === 0) return null;

  return (
    <div className="flex h-full items-center justify-start gap-2 relative bg-primary/10 backdrop-blur-sm rounded-md px-2">
      {pinnedItems.map((item) => {
        const fullHref = `${item.href}`;

        const isActive =
          pathname === fullHref ||
          (item.href !== "/" && pathname.startsWith(fullHref + "/"));

        return (
          <Button
            key={`${item.portalType}-${item.id}`}
            variant="ghost"
            size="smIcon"
            className={cn(
              "text-sidebar-foreground hover:text-primary transition-colors",
              isActive ? "bg-primary/20 text-primary" : "hover:bg-accent/50"
            )}
            asChild
            title={`${item.name} (${item.portalType})`}
          >
            <Link href={fullHref}>{getIcon(item.iconName)}</Link>
          </Button>
        );
      })}
    </div>
  );
}

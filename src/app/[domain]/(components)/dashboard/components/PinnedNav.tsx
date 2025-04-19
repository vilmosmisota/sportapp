import { usePinnedItems } from "../hooks/usePinnedItems";
import { NavItem, ICON_MAP } from "../constants";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import { cn } from "../../../../../lib/utils";

/**
 * PinnedNav - Shows pinned navigation items when the sidebar is collapsed
 * Uses localStorage for persistence via the usePinnedItems hook
 */
export const PinnedNav = ({
  navItems,
  pathname,
}: {
  navItems: { section: string; items: NavItem[] }[];
  pathname: string;
}) => {
  // Get pinned items from localStorage (via the hook)
  const { pinnedItemIds } = usePinnedItems();

  const filteredNavItems = navItems.filter(
    (section) => section.section !== "Default"
  );
  const allNavItems = filteredNavItems.flatMap((section) => section.items);

  const defaultItems =
    navItems.find((section) => section.section === "Default")?.items || [];

  // Filter items to only show pinned ones
  const pinnedItems = [...defaultItems, ...allNavItems].filter((item) =>
    pinnedItemIds.includes(item.id)
  );

  if (pinnedItems.length === 0) return null;

  return (
    <div className="flex h-full items-center justify-start gap-2 relative bg-primary/10 backdrop-blur-sm rounded-md px-4">
      {pinnedItems.map((item) => {
        const Icon = ICON_MAP[item.iconName as keyof typeof ICON_MAP];
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="smIcon"
            className={cn(
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
            )}
            asChild
          >
            <Link href={item.href}>{Icon && <Icon className="h-4 w-4" />}</Link>
          </Button>
        );
      })}
    </div>
  );
};

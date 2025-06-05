import DashboardNavItem, { NavItem } from "./DashboardNavItem";

interface NavItemsProps {
  items: NavItem[];
  isCollapsed?: boolean;
  pathname: string;
  pinnedItemIds?: number[];
  onTogglePin?: (itemId: number) => void;
  requiredPinnedItems?: number[];
}

export default function NavItems({
  items,
  isCollapsed,
  pathname,
  pinnedItemIds = [],
  onTogglePin,
  requiredPinnedItems = [1, 2], // Default to Home and Schedule
}: NavItemsProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <DashboardNavItem
          key={item.href}
          item={item}
          isCollapsed={isCollapsed}
          pathname={pathname}
          isPinned={pinnedItemIds.includes(item.id)}
          isRequiredPin={requiredPinnedItems.includes(item.id)}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
}

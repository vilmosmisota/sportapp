import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../../../../lib/utils";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../../components/ui/accordion";
import { NavSection } from "../constants";
import { Pin, PinOff, Lock } from "lucide-react";

interface DashboardMobileNavItemsProps {
  navItems: NavSection[];
  getIcon: (iconName: string) => React.ReactNode;
  setIsOpen: (isOpen: boolean) => void;
  pinnedItemIds?: number[];
  onTogglePin?: (itemId: number) => void;
}

export default function DashboardMobileNavItems({
  navItems,
  getIcon,
  setIsOpen,
  pinnedItemIds = [],
  onTogglePin,
}: DashboardMobileNavItemsProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>([]);
  // State for tracking which items are being hovered on
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Define required pinned items
  const requiredPinnedItems = [1, 2]; // Home and Schedule

  // Filter out the Default section
  const filteredNavItems = navItems.filter(
    (section) => section.section !== "Default"
  );

  // Get the Default section items separately for pinned items
  const defaultItems =
    navItems.find((section) => section.section === "Default")?.items || [];

  // Create a flat list of all nav items
  const allNavItems = [
    ...defaultItems,
    ...filteredNavItems.flatMap((section) => section.items),
  ];

  // Filter out pinned items
  const pinnedItems = allNavItems.filter((item) =>
    pinnedItemIds.includes(item.id)
  );

  const handlePinToggle = (e: React.MouseEvent, itemId: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't allow unpinning of required items
    if (onTogglePin && !requiredPinnedItems.includes(itemId)) {
      onTogglePin(itemId);
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-6 p-4">
        {/* Pinned items section */}
        {pinnedItems.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground/70 mb-2">
              Pinned
            </div>
            <div className="space-y-1">
              {pinnedItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-primary",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      {getIcon(item.iconName)}
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      {pathname === item.href && hoveredItem !== item.href && (
                        <div className="h-1 w-1 rounded-full bg-primary mr-2" />
                      )}
                      {item.pinnable &&
                        !item.disabled &&
                        onTogglePin &&
                        hoveredItem === item.href && (
                          <button
                            onClick={(e) => handlePinToggle(e, item.id)}
                            className={cn(
                              requiredPinnedItems.includes(item.id)
                                ? "text-primary cursor-default"
                                : "text-primary"
                            )}
                          >
                            {requiredPinnedItems.includes(item.id) ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <PinOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="h-px bg-border/50 my-4" />
          </div>
        )}

        {filteredNavItems.map((section) => (
          <div key={section.section}>
            {section.section ? (
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-1"
              >
                <AccordionItem value={section.section} className="border-none">
                  <AccordionTrigger className="py-1.5 text-xs font-medium text-muted-foreground/70 hover:no-underline">
                    {section.section}
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <div
                          key={item.href}
                          className="relative"
                          onMouseEnter={() => setHoveredItem(item.href)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                              pathname === item.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-primary",
                              item.disabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-x-3">
                              {getIcon(item.iconName)}
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center">
                              {pathname === item.href &&
                                hoveredItem !== item.href && (
                                  <div className="h-1 w-1 rounded-full bg-primary mr-2" />
                                )}
                              {item.pinnable &&
                                !item.disabled &&
                                onTogglePin &&
                                hoveredItem === item.href && (
                                  <button
                                    onClick={(e) => handlePinToggle(e, item.id)}
                                    className={cn(
                                      requiredPinnedItems.includes(item.id)
                                        ? "text-primary cursor-default"
                                        : pinnedItemIds.includes(item.id)
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {requiredPinnedItems.includes(item.id) ? (
                                      <Lock className="h-3.5 w-3.5" />
                                    ) : pinnedItemIds.includes(item.id) ? (
                                      <PinOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Pin className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                )}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-primary",
                        item.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-x-3">
                        {getIcon(item.iconName)}
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        {pathname === item.href &&
                          hoveredItem !== item.href && (
                            <div className="h-1 w-1 rounded-full bg-primary mr-2" />
                          )}
                        {item.pinnable &&
                          !item.disabled &&
                          onTogglePin &&
                          hoveredItem === item.href && (
                            <button
                              onClick={(e) => handlePinToggle(e, item.id)}
                              className={cn(
                                requiredPinnedItems.includes(item.id)
                                  ? "text-primary cursor-default"
                                  : pinnedItemIds.includes(item.id)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              {requiredPinnedItems.includes(item.id) ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : pinnedItemIds.includes(item.id) ? (
                                <PinOff className="h-3.5 w-3.5" />
                              ) : (
                                <Pin className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

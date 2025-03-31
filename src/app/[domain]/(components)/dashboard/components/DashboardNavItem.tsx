import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../components/ui/tooltip";
import Link from "next/link";
import { cn } from "../../../../../lib/utils";
import { NavItem, ICON_MAP } from "../constants";
import { Pin, PinOff, Lock } from "lucide-react";

interface NavItemProps {
  item: NavItem;
  isCollapsed?: boolean;
  pathname: string;
  isPinned?: boolean;
  isRequiredPin?: boolean;
  onTogglePin?: (itemId: number) => void;
}

export default function DashboardNavItem({
  item,
  isCollapsed,
  pathname,
  isPinned = false,
  isRequiredPin = false,
  onTogglePin,
}: NavItemProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showPinIcon, setShowPinIcon] = useState(false);
  const Icon = ICON_MAP[item.iconName as keyof typeof ICON_MAP];

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePin && item.pinnable && !isRequiredPin) {
      onTogglePin(item.id);
    }
  };

  const PinIcon = isRequiredPin ? Lock : isPinned ? PinOff : Pin;

  if (item.disabled) {
    return (
      <TooltipProvider key={item.href} delayDuration={0}>
        <Tooltip
          open={isCollapsed && openTooltip === item.href}
          onOpenChange={(open) => {
            if (open) {
              setOpenTooltip(item.href);
            } else {
              setOpenTooltip(null);
            }
          }}
        >
          <TooltipTrigger asChild>
            <div
              className={cn(
                "group/item flex rounded-md transition-all duration-200 relative cursor-not-allowed",
                isCollapsed
                  ? "w-10 h-10 justify-center items-center"
                  : "px-3 py-1.5 items-center",
                "text-muted-foreground/30"
              )}
              onClick={() => setOpenTooltip(item.href)}
            >
              <div
                className={cn(
                  isCollapsed
                    ? "flex items-center justify-center"
                    : "flex items-center gap-x-3 w-full"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10}>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{item.name}</span>
                {item.disabled && item.disabledReason ? (
                  <div className="text-xs text-amber-500 max-w-64">
                    <span className="font-medium">Required:</span>{" "}
                    {item.disabledReason}
                  </div>
                ) : (
                  item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider key={item.href} delayDuration={0}>
      <Tooltip
        open={isCollapsed && openTooltip === item.href}
        onOpenChange={(open) => {
          if (open) {
            setOpenTooltip(item.href);
          } else {
            setOpenTooltip(null);
          }
        }}
      >
        <TooltipTrigger asChild>
          <div
            className="relative"
            onMouseEnter={() => item.pinnable && setShowPinIcon(true)}
            onMouseLeave={() => item.pinnable && setShowPinIcon(false)}
          >
            <Link
              href={item.href}
              className={cn(
                "group/item flex rounded-md transition-all duration-200 relative",
                isCollapsed
                  ? "w-10 h-10 justify-center items-center"
                  : "px-3 py-1.5 items-center",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
              )}
            >
              <div
                className={cn(
                  isCollapsed
                    ? "flex items-center justify-center"
                    : "flex items-center gap-x-3 w-full"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
              </div>
              {pathname === item.href &&
                !isCollapsed &&
                (!showPinIcon || !item.pinnable) && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-primary" />
                )}
            </Link>

            {/* Pin button (shown ONLY on hover) */}
            {!isCollapsed && item.pinnable && onTogglePin && showPinIcon && (
              <button
                onClick={handleTogglePin}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1",
                  "text-muted-foreground hover:text-primary hover:bg-accent/30 transition-colors",
                  isPinned && "text-primary",
                  isRequiredPin && "cursor-default"
                )}
                aria-label={
                  isRequiredPin
                    ? "Always pinned"
                    : isPinned
                    ? "Unpin item"
                    : "Pin item"
                }
              >
                <PinIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={10}>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{item.name}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
              {item.pinnable && !isRequiredPin && (
                <button
                  onClick={handleTogglePin}
                  className={cn(
                    "mt-1 flex items-center gap-1 text-xs",
                    "text-muted-foreground hover:text-primary transition-colors"
                  )}
                >
                  <PinIcon className="h-3 w-3" />
                  {isPinned ? "Unpin from dashboard" : "Pin to dashboard"}
                </button>
              )}
              {item.pinnable && isRequiredPin && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Always pinned
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

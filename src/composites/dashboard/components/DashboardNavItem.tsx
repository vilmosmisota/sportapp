import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Permission } from "@/entities/role/Role.permissions";
import { cn } from "@/lib/utils";
import { Loader2, Lock, Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { usePathname as useNextPathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ICON_MAP } from "../types/constants";

export interface NavItem {
  id: number;
  name: string;
  href: string;
  iconName: string;
  description?: string;
  permissions: Permission[];
  disabled?: boolean;
  disabledReason?: string;
  pinnable?: boolean;
}

interface NavItemProps {
  item: NavItem;
  isCollapsed?: boolean;
  pathname: string;
  isPinned?: boolean;
  isRequiredPin?: boolean;
  onTogglePin?: (itemId: number) => void;
  portalColor?: string;
}

export default function DashboardNavItem({
  item,
  isCollapsed,
  pathname,
  isPinned = false,
  isRequiredPin = false,
  onTogglePin,
  portalColor,
}: NavItemProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showPinIcon, setShowPinIcon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);
  const LOADING_THRESHOLD = 100;

  const router = useRouter();
  const currentPathname = useNextPathname();
  const Icon = ICON_MAP[item.iconName as keyof typeof ICON_MAP];

  const isHome = item.href === "/management" || item.href === "/attendance";
  const isActive = isHome
    ? pathname === item.href
    : pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href + "/"));

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      setIsLoading(false);
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [currentPathname]);

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePin && item.pinnable && !isRequiredPin) {
      onTogglePin(item.id);
    }
  };

  const handleNavigation = (e: React.MouseEvent) => {
    if (pathname === item.href || item.disabled) return;

    e.preventDefault();

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    router.push(item.href);

    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && currentPathname === pathname) {
        setIsLoading(true);
      }
      loadingTimeoutRef.current = null;
    }, LOADING_THRESHOLD);
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
                "text-sidebar-foreground/30"
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
                  <span className="text-sm font-medium truncate capitalize">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10}>
              <div className="flex flex-col gap-1">
                <span className="font-medium capitalize">{item.name}</span>
                {item.disabled && item.disabledReason ? (
                  <div className="text-xs text-amber-500 max-w-64">
                    <span className="font-medium">Required:</span>{" "}
                    {item.disabledReason}
                  </div>
                ) : (
                  item.description && (
                    <span className="text-xs text-sidebar-foreground">
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
              onClick={handleNavigation}
              className={cn(
                "group/item flex rounded-md transition-all duration-200 relative",
                isCollapsed
                  ? "w-10 h-10 justify-center items-center"
                  : "px-3 py-1.5 items-center",
                isActive
                  ? portalColor
                    ? ""
                    : "text-primary"
                  : "text-sidebar-foreground hover:bg-accent/50 hover:text-primary"
              )}
              style={
                isActive && portalColor ? { color: portalColor } : undefined
              }
            >
              <div
                className={cn(
                  isCollapsed
                    ? "flex items-center justify-center"
                    : "flex items-center gap-x-3 w-full"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  Icon && <Icon className="h-4 w-4" />
                )}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate capitalize">
                    {item.name}
                  </span>
                )}
              </div>
              {pathname === item.href &&
                !isCollapsed &&
                (!showPinIcon || !item.pinnable) && (
                  <div
                    className={cn(
                      "ml-auto h-1 w-1 rounded-full",
                      portalColor ? "" : "bg-primary"
                    )}
                    style={
                      portalColor ? { backgroundColor: portalColor } : undefined
                    }
                  />
                )}
            </Link>

            {/* Pin button (shown ONLY on hover) */}
            {!isCollapsed && item.pinnable && onTogglePin && showPinIcon && (
              <button
                onClick={handleTogglePin}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1",
                  "text-sidebar-foreground hover:bg-accent/30 transition-colors",
                  portalColor ? "" : "hover:text-primary",
                  isPinned && (portalColor ? "" : "text-primary"),
                  isRequiredPin && "cursor-default"
                )}
                style={
                  isPinned && portalColor ? { color: portalColor } : undefined
                }
                onMouseEnter={(e) => {
                  if (portalColor && !isPinned) {
                    e.currentTarget.style.color = portalColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (portalColor && !isPinned) {
                    e.currentTarget.style.color = "";
                  }
                }}
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
              <span className="font-medium capitalize">{item.name}</span>
              {item.description && (
                <span className="text-xs text-sidebar-foreground">
                  {item.description}
                </span>
              )}
              {item.pinnable && !isRequiredPin && (
                <button
                  onClick={handleTogglePin}
                  className={cn(
                    "mt-1 flex items-center gap-1 text-xs",
                    "text-sidebar-foreground transition-colors",
                    portalColor ? "" : "hover:text-primary"
                  )}
                  style={portalColor ? undefined : undefined}
                  onMouseEnter={(e) => {
                    if (portalColor) {
                      e.currentTarget.style.color = portalColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (portalColor) {
                      e.currentTarget.style.color = "";
                    }
                  }}
                >
                  <PinIcon className="h-3 w-3" />
                  {isPinned ? "Unpin from dashboard" : "Pin to dashboard"}
                </button>
              )}
              {item.pinnable && isRequiredPin && (
                <div className="mt-1 flex items-center gap-1 text-xs text-sidebar-foreground">
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

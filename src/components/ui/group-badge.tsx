import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Group } from "@/entities/group/Group.schema";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/libs/utils";
import { getContrastColor } from "@/utils/color.utils";

type GroupBadgeProps = {
  group: Group;
  tenantGroupsConfig?: TenantGroupsConfig;
  className?: string;
  showTooltip?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
};

const sizeClasses = {
  sm: "text-xs py-0.5 px-2",
  default: "text-sm py-1 px-3",
  lg: "text-base py-1.5 px-4",
};

export function GroupBadge({
  group,
  tenantGroupsConfig,
  className,
  showTooltip = false,
  size = "default",
  variant = "outline",
}: GroupBadgeProps) {
  const displayText = createGroupDisplay(group, tenantGroupsConfig);
  const customColor = group.appearance?.color;

  const badge = (
    <Badge
      variant={customColor ? "default" : variant}
      className={cn(
        "whitespace-nowrap",
        sizeClasses[size],
        customColor && "border-0",
        className
      )}
      style={
        customColor
          ? {
              backgroundColor: customColor,
              color: getContrastColor(customColor),
            }
          : undefined
      }
    >
      {displayText}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{displayText}</p>
            {group.customName && (
              <p className="text-xs text-muted-foreground">
                Custom: {group.customName}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

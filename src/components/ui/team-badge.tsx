import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/utils";
import { Team, TeamGender } from "@/entities/team/Team.schema";
import { Opponent } from "@/entities/opponent/Opponent.schema";
import {
  getDisplayGender,
  getDisplayAgeGroup,
} from "@/entities/team/Team.schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TeamLike = {
  age?: string | null;
  gender?: TeamGender | string | null;
  skill?: string | null;
  appearance?: {
    color?: string | null;
  } | null;
};

type TeamBadgeProps = {
  team: TeamLike;
  className?: string;
  showTooltip?: boolean;
  size?: "sm" | "default" | "lg";
};

const sizeClasses = {
  sm: "text-xs py-0.5 px-2",
  default: "text-sm py-1 px-3",
  lg: "text-base py-1.5 px-4",
};

export function TeamBadge({
  team,
  className,
  showTooltip = false,
  size = "default",
}: TeamBadgeProps) {
  const displayText = [
    getDisplayAgeGroup(team.age),
    getDisplayGender(team.gender, team.age),
    team.skill,
  ]
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0
    )
    .join(" • ");

  const customColor = team.appearance?.color;
  const textColor = customColor ? getContrastColor(customColor) : undefined;

  const badge = (
    <Badge
      variant="secondary"
      className={cn("whitespace-nowrap", sizeClasses[size], className)}
      style={
        customColor
          ? {
              backgroundColor: customColor,
              color: textColor,
              borderColor: "transparent",
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
          <p>{displayText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Remove the hash if it exists
  const color = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

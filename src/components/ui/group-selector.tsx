"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Group } from "@/entities/group/Group.schema";
import { createGroupDisplay } from "@/entities/group/Group.utils";
import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/lib/utils";
import * as React from "react";

interface GroupSelectorProps {
  groups?: Group[];
  selectedGroup?: Group | null;
  onGroupChange?: (groupId: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
  tenantGroupsConfig?: TenantGroupsConfig;
}

export const GroupSelector = React.forwardRef<
  React.ElementRef<typeof Select>,
  GroupSelectorProps
>(
  (
    {
      groups = [],
      selectedGroup,
      onGroupChange,
      isLoading = false,
      placeholder = "Select group",
      className,
      width = "w-[200px]",
      disabled = false,
      tenantGroupsConfig,
    },
    ref
  ) => {
    // Show skeleton while loading
    if (isLoading) {
      return <Skeleton className={cn("h-10", width)} />;
    }

    // Don't render if no groups available
    if (!groups || groups.length === 0) {
      return null;
    }

    return (
      <Select
        value={selectedGroup?.id.toString()}
        onValueChange={onGroupChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(width, className)} ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => {
            const displayName = createGroupDisplay(group, tenantGroupsConfig);
            return (
              <SelectItem key={group.id} value={group.id.toString()}>
                {displayName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }
);

GroupSelector.displayName = "GroupSelector";

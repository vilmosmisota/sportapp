"use client";

import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

interface DashboardBrandingProps {
  domain: string;
  className?: string;
  tenant?: Tenant;
  isLoading?: boolean;
}

export function DashboardBranding({
  domain,
  className,
  tenant,
  isLoading = false,
}: DashboardBrandingProps) {
  return (
    <div className="flex items-center h-full">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={tenant?.logo ? tenant?.logo : ""} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {tenant?.name ? tenant?.name.slice(0, 2).toUpperCase() : "N/A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm truncate">
            {!isLoading ? tenant?.name : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}

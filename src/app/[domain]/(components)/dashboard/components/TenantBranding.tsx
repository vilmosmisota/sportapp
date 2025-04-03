import React from "react";
import { Tenant } from "../../../../../entities/tenant/Tenant.schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../../components/ui/avatar";

interface TenantBrandingProps {
  tenant?: Tenant;
  isLoading?: boolean;
}

export function TenantBranding({
  tenant,
  isLoading = false,
}: TenantBrandingProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-4 animate-pulse p-4">
        <div className="w-10 h-10 rounded-full bg-muted"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-3 w-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-3 p-4 border-t border-primary-100/20">
      <Avatar className="h-12 w-12">
        <AvatarImage src={tenant?.logo || ""} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {tenant?.name ? tenant?.name.slice(0, 2).toUpperCase() : "N/A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <span className="font-medium text-sm">{tenant?.name}</span>
        <span className="text-xs text-muted-foreground">
          Powered by SportWise
        </span>
      </div>
    </div>
  );
}

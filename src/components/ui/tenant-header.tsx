import Image from "next/image";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { PageHeader } from "@/components/ui/page-header";
import { ReactNode } from "react";
import { Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TenantHeaderProps {
  tenant?: Tenant;
  title?: string;
  description?: string;
  actions?: ReactNode;
  backButton?: {
    href: string;
    label?: string;
  };
  isLoading?: boolean;
}

export function TenantHeader({
  tenant,
  title,
  description,
  actions,
  backButton,
  isLoading = false,
}: TenantHeaderProps) {
  if (isLoading || !tenant) {
    return (
      <div className="flex items-center justify-between pb-6">
        <div className="space-y-1">
          {backButton && <PageHeader title="" backButton={backButton} />}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-7 w-44" />
              {description && <Skeleton className="h-4 w-64 mt-1" />}
            </div>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pb-6">
      <div className="space-y-1">
        {backButton && <PageHeader title="" backButton={backButton} />}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={tenant.logo || ""} alt={`${tenant.name} logo`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {tenant.name ? tenant.name.slice(0, 2).toUpperCase() : "N/A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tenant.name}
            </h1>

            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

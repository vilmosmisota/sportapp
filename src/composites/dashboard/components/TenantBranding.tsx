import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tenant } from "@/entities/tenant/Tenant.schema";

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
      <div className="flex flex-col items-center text-center gap-3 p-4 border-t border-primary-100/20 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-muted"></div>
        <div className="flex flex-col items-center">
          <div className="h-3 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-3 p-4 border-t border-primary-100/20">
      {tenant?.tenantConfigs?.general?.logo && (
        <Avatar className="h-12 w-12">
          <AvatarImage src={tenant.tenantConfigs.general.logo} />
        </Avatar>
      )}
      <div className="flex flex-col items-center">
        <span className="text-xs text-muted-foreground">
          Powered by SportWise
        </span>
      </div>
    </div>
  );
}

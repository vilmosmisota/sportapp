import { Button } from "@/components/ui/button";
import { Permission } from "@/entities/role/Role.permissions";
import { Access } from "@/entities/role/Role.schema";
import { ComponentProps } from "react";
import { useTenantAndUserAccessContext } from "./TenantAndUserAccessContext";

interface PermissionButtonProps extends ComponentProps<typeof Button> {
  permission?: Permission;
  fallback?: React.ReactNode; // Optional fallback content when permission is denied
}

export function PermissionButton({
  permission,
  fallback = null,
  ...props
}: PermissionButtonProps) {
  const { tenantUser, isLoading, error } = useTenantAndUserAccessContext();

  if (isLoading || error) {
    return fallback;
  }

  if (!tenantUser?.user) {
    return fallback;
  }

  if (!permission) {
    return <Button {...props} />;
  }

  const userAccess = tenantUser.role?.access || [];
  const hasSystemAccess = userAccess.includes(Access.SYSTEM);

  if (hasSystemAccess) {
    return <Button {...props} />;
  }

  const hasPermission =
    tenantUser.role?.permissions.includes(permission) ?? false;

  if (!hasPermission) {
    return fallback;
  }

  return <Button {...props} />;
}

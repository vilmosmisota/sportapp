import { Button } from "@/components/ui/button";
import { Permission } from "@/entities/role/Role.permissions";
import { UserDomain } from "@/entities/user/User.schema";
import { ComponentProps } from "react";
import { useTenantAndUserAccessContext } from "./TenantAndUserAccessContext";

interface PermissionButtonProps extends ComponentProps<typeof Button> {
  permission?: Permission;
  fallback?: React.ReactNode; // Optional fallback content when permission is denied
  allowSystemRole?: boolean;
}

export function PermissionButton({
  permission,
  fallback = null,
  allowSystemRole = true,
  ...props
}: PermissionButtonProps) {
  const { user, isLoading, error } = useTenantAndUserAccessContext();

  if (!permission) {
    return <Button {...props} />;
  }

  if (isLoading || error) {
    return fallback;
  }

  if (!user) {
    return fallback;
  }

  const hasSystemDomain =
    user.userDomains?.includes(UserDomain.SYSTEM) ?? false;

  // System domain users always have access, regardless of allowSystemRole setting
  if (hasSystemDomain) {
    return <Button {...props} />;
  }

  const hasPermission = user.role?.permissions.includes(permission) ?? false;

  if (!hasPermission) {
    return fallback;
  }

  return <Button {...props} />;
}

import { Button } from "@/components/ui/button";
import { Permission, RoleDomain } from "@/entities/role/Role.permissions";
import { useCurrentUser } from "@/entities/user/User.query";
import { ComponentProps } from "react";

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
  const { data: user, isLoading, error } = useCurrentUser();

  console.log("PermissionButton:", { user, isLoading, error });

  // If no permission required, show button
  if (!permission) {
    return <Button {...props} />;
  }

  // If loading or error, don't show button
  if (isLoading || error) {
    return fallback;
  }

  // If no user data, don't show button
  if (!user) {
    return fallback;
  }

  // Check if user has system role
  const hasSystemRole =
    user.roles?.some(
      (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
    ) ?? false;

  // If user has system role and we allow system roles, show button
  if (allowSystemRole && hasSystemRole) {
    return <Button {...props} />;
  }

  // Otherwise check specific permission
  const hasPermission =
    user.roles?.some((userRole) =>
      userRole.role?.permissions.includes(permission)
    ) ?? false;

  if (!hasPermission) {
    return fallback;
  }

  return <Button {...props} />;
}

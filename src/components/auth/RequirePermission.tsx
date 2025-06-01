import { Permission } from "@/entities/role/Role.permissions";
import { UserDomain } from "@/entities/user/User.schema";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useTenantAndUserAccessContext } from "./TenantAndUserAccessContext";

interface RequirePermissionProps {
  children: ReactNode;
  permissions?: Permission[];
  redirectTo?: string;
  allowSystemRole?: boolean;
}

export function RequirePermission({
  children,
  permissions = [],
  redirectTo = "/",
  allowSystemRole = true,
}: RequirePermissionProps) {
  const router = useRouter();
  const { user, isLoading } = useTenantAndUserAccessContext();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Check if user has system domain - system users have access to everything
  const hasSystemDomain =
    user.userDomains?.includes(UserDomain.SYSTEM) ?? false;

  if (allowSystemRole && hasSystemDomain) {
    return <>{children}</>;
  }

  // Check if user has any of the required permissions
  const hasPermission =
    permissions.length === 0 ||
    (user.role?.permissions.some((permission) =>
      permissions.includes(permission as Permission)
    ) ??
      false);

  if (!hasPermission) {
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
}

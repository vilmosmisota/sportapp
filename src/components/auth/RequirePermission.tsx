import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Permission, RoleDomain } from "@/entities/role/Role.permissions";
import { useCurrentUser } from "@/entities/user/User.query";

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
  allowSystemRole = false,
}: RequirePermissionProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // Check if user has system role
  const hasSystemRole = (user.roles || []).some(
    (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
  );

  if (allowSystemRole && hasSystemRole) {
    return <>{children}</>;
  }

  // Check if user has any of the required permissions
  const hasPermission =
    permissions.length === 0 ||
    (user.roles || []).some((userRole) =>
      userRole.role?.permissions.some((permission) =>
        permissions.includes(permission)
      )
    );

  if (!hasPermission) {
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
}

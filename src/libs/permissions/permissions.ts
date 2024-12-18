import { UserRole } from "@/entities/user/User.schema";

type PermissionCheck = {
  userRoles?: UserRole[];
  allowedRoles: UserRole[];
};

export const checkPermission = ({
  userRoles = [],
  allowedRoles,
}: PermissionCheck): boolean => {
  if (!userRoles.length) return false;
  return userRoles.some((role) => allowedRoles.includes(role));
};

// Common permission checks
export const Permissions = {
  Users: {
    manage: (userRoles?: UserRole[]) =>
      checkPermission({
        userRoles,
        allowedRoles: [UserRole.SUPER_ADMIN],
      }),
  },
  Teams: {
    manage: (userRoles?: UserRole[]) =>
      checkPermission({
        userRoles,
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      }),
  },
  // Add more permission groups as needed
};

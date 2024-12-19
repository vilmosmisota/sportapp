import { AdminRole, DomainRole } from "@/entities/user/User.schema";
import { UserEntity } from "@/entities/user/User.schema";

type PermissionCheck = {
  userEntity?: UserEntity | null;
  requiredAdminRoles?: AdminRole[];
  requiredDomainRoles?: DomainRole[];
};

export const checkPermission = ({
  userEntity,
  requiredAdminRoles = [],
  requiredDomainRoles = [],
}: PermissionCheck): boolean => {
  if (!userEntity) return false;

  // If no specific roles are required, return true
  if (!requiredAdminRoles.length && !requiredDomainRoles.length) return true;

  // Check admin roles - ensure we handle null adminRole
  const hasAdminRole =
    requiredAdminRoles.length === 0 ||
    (!!userEntity.adminRole &&
      requiredAdminRoles.includes(userEntity.adminRole));

  // Check domain roles - ensure we handle null domainRole
  const hasDomainRole =
    requiredDomainRoles.length === 0 ||
    (!!userEntity.domainRole &&
      requiredDomainRoles.includes(userEntity.domainRole));

  return hasAdminRole && hasDomainRole;
};

// Common permission checks
export const Permissions = {
  Users: {
    manage: (userEntity?: UserEntity | null) =>
      checkPermission({
        userEntity,
        requiredAdminRoles: [AdminRole.ADMIN],
      }),
    edit: (userEntity?: UserEntity | null) =>
      checkPermission({
        userEntity,
        requiredAdminRoles: [AdminRole.ADMIN, AdminRole.EDITOR],
      }),
  },
  Teams: {
    manage: (userEntity?: UserEntity | null) =>
      checkPermission({
        userEntity,
        requiredAdminRoles: [AdminRole.ADMIN, AdminRole.EDITOR],
        requiredDomainRoles: [DomainRole.COACH],
      }),
  },
  // Add more permission groups as needed
};

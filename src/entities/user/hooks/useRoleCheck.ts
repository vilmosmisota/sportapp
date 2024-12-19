import { useUserRoles } from "./useUserRoles";
import { AdminRole, DomainRole } from "../User.schema";

export const useRoleCheck = () => {
  const userEntity = useUserRoles();

  const hasRole = (adminRole?: AdminRole, domainRole?: DomainRole) => {
    if (!userEntity) return false;

    const hasAdminRole = !adminRole || userEntity.adminRole === adminRole;
    const hasDomainRole = !domainRole || userEntity.domainRole === domainRole;

    return hasAdminRole && hasDomainRole;
  };

  const isAdmin = () => userEntity?.adminRole === AdminRole.ADMIN;
  const isEditor = () => userEntity?.adminRole === AdminRole.EDITOR;
  const isMember = () => userEntity?.adminRole === AdminRole.MEMBER;

  const isCoach = () => userEntity?.domainRole === DomainRole.COACH;
  const isPlayer = () => userEntity?.domainRole === DomainRole.PLAYER;
  const isParent = () => userEntity?.domainRole === DomainRole.PARENT;

  return {
    hasRole,
    isAdmin,
    isEditor,
    isMember,
    isCoach,
    isPlayer,
    isParent,
    userEntity,
  };
};

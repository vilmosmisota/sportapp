import { useCurrentUser as useCurrentUserBase } from "../User.query";
import { AdminRole, DomainRole } from "../User.schema";

export const useCurrentUser = () => {
  const { data: user } = useCurrentUserBase();

  const hasRole = (adminRole?: AdminRole, domainRole?: DomainRole) => {
    if (!user?.entity) return false;

    const hasAdminRole = !adminRole || user.entity.adminRole === adminRole;
    const hasDomainRole = !domainRole || user.entity.domainRole === domainRole;

    return hasAdminRole && hasDomainRole;
  };

  return {
    user,
    hasRole,
  };
};

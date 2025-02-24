import { RoleDomain } from "../../role/Role.permissions";
import { useUsers } from "../User.query";

export const useParentUsers = (tenantId: string) => {
  const { data: users = [], ...rest } = useUsers(tenantId);

  const filteredUsers = users.filter(
    (user) =>
      user.roles?.some((role) => role.role?.domain === RoleDomain.FAMILY) ??
      false
  );

  return { ...rest, data: filteredUsers };
};

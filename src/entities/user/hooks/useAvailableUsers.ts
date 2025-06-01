import { useUsers } from "../User.query";

export const useAvailableUsers = (tenantId: string) => {
  const { data: users = [], ...rest } = useUsers(tenantId);

  // Filter users that don't have an existing member profile
  const availableUsers = users.filter((user) => !user.member);

  return { ...rest, data: availableUsers };
};

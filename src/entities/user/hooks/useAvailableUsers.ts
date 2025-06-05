import { useMemo } from "react";
import { useUsers } from "../User.query";

export const useAvailableUsers = (tenantId: string) => {
  const { data: users = [], ...rest } = useUsers(tenantId);

  const availableUsers = useMemo(() => {
    return users.filter((user) => !user.member);
  }, [users]);

  return { ...rest, data: availableUsers };
};

import { RoleDomain } from "../../role/Role.permissions";
import { useUsers } from "../User.query";
import { usePlayers } from "../../player/Player.actions.client";

export const usePlayerUsers = (tenantId: string) => {
  const { data: users = [], ...rest } = useUsers(tenantId);
  const { data: players = [] } = usePlayers(tenantId);

  // Get all user IDs that are already assigned as player owners
  const assignedPlayerUserIds = players
    .flatMap((p) => p.userConnections)
    .filter((uc) => uc?.isOwner)
    .map((uc) => uc?.userId)
    .filter(Boolean);

  const filteredUsers = users.filter(
    (user) =>
      (user.roles ?? []).some(
        (role) => role.role?.domain === RoleDomain.PLAYER
      ) && !assignedPlayerUserIds.includes(user.id)
  );

  return { ...rest, data: filteredUsers };
};

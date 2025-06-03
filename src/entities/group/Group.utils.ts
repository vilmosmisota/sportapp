import { Group } from "./Group.schema";

export const isOpponentGroup = (group: Group): boolean => {
  return group.opponentId !== null && group.opponentId !== undefined;
};

export const isTenantGroup = (group: Group): boolean => {
  return group.opponentId === null || group.opponentId === undefined;
};

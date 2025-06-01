import { Group } from "./Group.schema";

export const getDisplayAgeGroup = (
  ageGroup: string | null | undefined
): string => {
  if (!ageGroup) return "";
  return ageGroup.split("#")[0];
};

export const isOpponentGroup = (group: Group): boolean => {
  return group.opponentId !== null && group.opponentId !== undefined;
};

export const isTenantGroup = (group: Group): boolean => {
  return group.opponentId === null || group.opponentId === undefined;
};

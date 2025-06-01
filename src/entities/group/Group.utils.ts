import { Tenant } from "../tenant/Tenant.schema";
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

/**
 * Get the dynamic group route path based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @param domain - The domain for the route
 * @returns The complete path to the dynamic group route
 */
export function getGroupRoutePath(tenant: Tenant, domain: string): string {
  const groupsConfig = tenant.tenantConfigs?.groups;
  const slug = groupsConfig?.slug || "groups";
  return `/${domain}/o/dashboard/${slug}`;
}

/**
 * Get the display name for groups based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @returns The display name for groups
 */
export function getGroupsDisplayName(tenant: Tenant): string {
  const groupsConfig = tenant.tenantConfigs?.groups;
  return groupsConfig?.displayName || "Groups";
}

/**
 * Get the slug for groups based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @returns The slug for groups
 */
export function getGroupSlug(tenant: Tenant): string {
  const groupsConfig = tenant.tenantConfigs?.groups;
  return groupsConfig?.slug || "groups";
}

/**
 * Get the singular form of the group display name
 * @param tenant - The tenant object with configuration
 * @returns The singular display name for groups
 */
export function getGroupsSingularDisplayName(tenant: Tenant): string {
  const displayName = getGroupsDisplayName(tenant);
  return displayName.endsWith("s") ? displayName.slice(0, -1) : displayName;
}

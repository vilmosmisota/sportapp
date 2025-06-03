import { differenceInYears } from "date-fns";
import { Tenant } from "../tenant/Tenant.schema";

/**
 * Get the dynamic member route path based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @param domain - The domain for the route
 * @returns The complete path to the dynamic member route
 */
export function getPerformerRoutePath(tenant: Tenant, domain: string): string {
  const performersConfig = tenant.tenantConfigs?.performers;
  const slug = performersConfig?.slug || "performers";
  return `/${domain}/o/dashboard/${slug}`;
}

/**
 * Get the display name for members based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @returns The display name for members
 */
export function getTenantPerformerName(tenant: Tenant): string {
  const performersConfig = tenant.tenantConfigs?.performers;
  return performersConfig?.displayName || "Performers";
}

/**
 * Get the slug for members based on tenant configuration
 * @param tenant - The tenant object with configuration
 * @returns The slug for members
 */
export function getTenantPerformerSlug(tenant: Tenant): string {
  const performersConfig = tenant.tenantConfigs?.performers;
  return performersConfig?.slug || "performers";
}

/**
 * Get the singular form of the member display name
 * @param tenant - The tenant object with configuration
 * @returns The singular display name for members
 */
export function getTenantPerformerSingularName(tenant: Tenant): string {
  const displayName = getTenantPerformerName(tenant);
  return displayName.endsWith("s") ? displayName.slice(0, -1) : displayName;
}

export function getAgeFromDateOfBirth(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return differenceInYears(today, birthDate);
}

export function isEligibleForUserAccount(dateOfBirth: string): boolean {
  const age = getAgeFromDateOfBirth(dateOfBirth);
  return age >= 13;
}

import { useTenantByDomain } from "../../../../../entities/tenant/Tenant.query";

export function useTenantConfig(domain: string) {
  const { data: tenant, isLoading: isTenantLoading } =
    useTenantByDomain(domain);

  // Check if team management configuration is complete
  const teamManagementConfigComplete = Boolean(
    tenant?.groupTypes &&
      tenant.groupTypes.ageGroups?.length > 0 &&
      tenant.groupTypes.skillLevels?.length > 0 &&
      tenant.groupTypes.positions?.length > 0
  );

  // Check if training locations are configured
  const trainingLocationsConfigured = Boolean(
    tenant?.trainingLocations && tenant.trainingLocations.length > 0
  );

  // Check if game locations are configured
  const gameLocationsConfigured = Boolean(
    tenant?.gameLocations &&
      tenant.gameLocations.length > 0 &&
      tenant.competitionTypes &&
      tenant.competitionTypes.length > 0
  );

  return {
    tenant,
    isTenantLoading,
    teamManagementConfigComplete,
    trainingLocationsConfigured,
    gameLocationsConfigured,
  };
}

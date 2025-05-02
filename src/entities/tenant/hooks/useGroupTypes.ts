import { useMemo } from "react";
import { Tenant } from "../Tenant.schema";

export function useTenantGroupTypes(tenant?: Tenant | string) {
  // If tenant is a string (domain), we can't use it directly
  // The component will need to fetch the tenant data separately
  const tenantObject = typeof tenant === "object" ? tenant : undefined;

  const ageGroups = useMemo(() => {
    if (!tenantObject?.groupTypes?.ageGroups) return [];
    return tenantObject.groupTypes.ageGroups;
  }, [tenantObject?.groupTypes?.ageGroups]);

  const skillLevels = useMemo(() => {
    if (!tenantObject?.groupTypes?.skillLevels) return [];
    return tenantObject.groupTypes.skillLevels;
  }, [tenantObject?.groupTypes?.skillLevels]);

  return {
    ageGroups,
    skillLevels,
  };
}

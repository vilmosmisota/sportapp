import { useMemo } from "react";
import { Tenant } from "../Tenant.schema";

export function useTenantGroupTypes(tenant?: Tenant) {
  const ageGroups = useMemo(() => {
    if (!tenant?.groupTypes?.ageGroups) return [];
    return tenant.groupTypes.ageGroups;
  }, [tenant?.groupTypes?.ageGroups]);

  const skillLevels = useMemo(() => {
    if (!tenant?.groupTypes?.skillLevels) return [];
    return tenant.groupTypes.skillLevels;
  }, [tenant?.groupTypes?.skillLevels]);

  return {
    ageGroups,
    skillLevels,
  };
}

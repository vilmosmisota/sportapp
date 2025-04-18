import { useMemo } from "react";
import { useTenantByDomain } from "../Tenant.query";

export function useTenantGroupTypes(domain: string) {
  const { data: tenant } = useTenantByDomain(domain);

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

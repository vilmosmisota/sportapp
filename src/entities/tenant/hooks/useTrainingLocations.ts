import { useMemo } from "react";
import { useTenantByDomain } from "../Tenant.query";

export function useTrainingLocations(domain: string) {
  const { data: tenant } = useTenantByDomain(domain);

  const locations = useMemo(() => {
    if (!tenant?.trainingLocations) return [];
    return tenant.trainingLocations;
  }, [tenant?.trainingLocations]);

  return locations;
}

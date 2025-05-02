import { useMemo } from "react";
import { Tenant } from "../Tenant.schema";

export function useTrainingLocations(tenant: Tenant) {
  const locations = useMemo(() => {
    if (!tenant?.trainingLocations) return [];
    return tenant.trainingLocations;
  }, [tenant?.trainingLocations]);

  return locations;
}

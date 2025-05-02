import { useMemo } from "react";
import { Tenant } from "../Tenant.schema";

export function useTrainingLocations(tenant: Tenant | string) {
  // If tenant is a string (domain), we can't use it directly
  // The component will need to fetch the tenant data separately
  const tenantObject = typeof tenant === "object" ? tenant : undefined;

  const locations = useMemo(() => {
    if (!tenantObject?.trainingLocations) return [];
    return tenantObject.trainingLocations;
  }, [tenantObject?.trainingLocations]);

  return locations;
}

import { useTenantByDomain } from "../Tenant.query";

export function usePlayerSettings(domain: string) {
  const { data: tenant } = useTenantByDomain(domain);

  return tenant?.playerSettings;
}

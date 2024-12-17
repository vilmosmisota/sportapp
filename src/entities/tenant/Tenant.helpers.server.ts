import { cookies } from "next/headers";
import { getTenantInfoCookieKey } from "./Tenant.utils";
import { TenantType } from "./Tenant.schema";

export const getTenantInfoFromServerCookie = (tenantSlug: string) => {
  const cookieStore = cookies();
  const cookieKey = getTenantInfoCookieKey(tenantSlug);
  const tenantInfo = cookieStore.get(cookieKey)?.value ?? "";

  const [tenantId, tenantTypeFromCookie] = tenantInfo.split(":");

  if (!tenantId || !tenantTypeFromCookie) {
    return undefined;
  }

  const tenantType = tenantTypeFromCookie as TenantType;

  return {
    tenantType,
    tenantId,
  };
};

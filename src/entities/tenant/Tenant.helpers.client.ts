import { getCookie } from "@/utils/cookies";
import { getTenantInfoCookieKey } from "./Tenant.utils";
import { TenantType } from "./Tenant.schema";

export const getTenantInfoFromClientCookie = (tenantSlug: string) => {
  const cookieKey = getTenantInfoCookieKey(tenantSlug);
  const tenantInfo = getCookie(cookieKey) ?? "";

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

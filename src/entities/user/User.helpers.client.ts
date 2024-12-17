import { getCookie } from "@/utils/cookies";
import { getTenantUserCookieKey } from "./User.utils";

export const checkTenantUserClientCookie = (
  userId: string,
  tenantId: string
) => {
  const tenantUserCookieKey = getTenantUserCookieKey(userId, tenantId);

  const tenantUserCookie = getCookie(tenantUserCookieKey) ?? "";
  if (tenantUserCookie) {
    return true;
  }
  return false;
};

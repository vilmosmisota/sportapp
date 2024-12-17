import { cookies } from "next/headers";
import { getTenantUserCookieKey } from "./User.utils";

export const checkTenantUserServerCookie = (
  userId: string,
  tenantId: string
) => {
  const cookieStore = cookies();

  const tenantUserCookieKey = getTenantUserCookieKey(userId, tenantId);

  const tenantUserCookie = cookieStore.get(tenantUserCookieKey)?.value ?? "";
  if (tenantUserCookie) {
    return true;
  }
  return false;
};

export const getTenantUserCookieKey = (userId: string, tenantId: string) => {
  return `${userId}-${tenantId}`;
};

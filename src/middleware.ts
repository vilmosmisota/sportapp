import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./libs/supabase/middleware";
import { TenantType } from "./entities/tenant/Tenant.schema";
import { getTenantUserCookieKey } from "./entities/user/User.utils";
import { getTenantInfoByDomain } from "./entities/tenant/Tenant.services";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const ROOT_DOMAIN = "sportwise.net";
  const LOCAL_DOMAIN = "localhost:3000";

  const tenantDomain = req.headers.get("host");

  if (tenantDomain === LOCAL_DOMAIN || tenantDomain === ROOT_DOMAIN) {
    return NextResponse.next();
  }

  const domainParts = tenantDomain?.split(".");
  const subDomain = domainParts?.at(0) ?? "";
  const rootDomain = domainParts?.at(1) ?? "";
  let protocol = rootDomain === LOCAL_DOMAIN ? "http" : "https";

  const urlToRewrite = getUrlToRewrite(req);
  const { supabase, response } = await updateSession(req, urlToRewrite);

  // Check if tenant type is in cookies

  const tenantInfoCookieKey = `${subDomain}-tenant-info`;
  const tenantInfoCookie = req.cookies.get(tenantInfoCookieKey);

  let tenantType: TenantType | null = null;
  let tenantId: string | null = null;

  if (tenantInfoCookie) {
    const [id, type] = tenantInfoCookie.value.split(":");
    tenantType = type as TenantType;
    tenantId = id;
  } else {
    // If not in cookies, fetch from database using the supabase instance
    const { tenantId: id, tenantType: type } = await getTenantInfoByDomain(
      subDomain,
      supabase
    );

    tenantType = type;
    tenantId = id.toString();
  }

  if (!tenantType || !tenantId) {
    // If no tenant type or id found, redirect to root
    return NextResponse.redirect(new URL(`${protocol}://${ROOT_DOMAIN}/`));
  }

  response.cookies.set(tenantInfoCookieKey, `${tenantId}:${tenantType}`, {
    maxAge: 31536000, // 1 year in seconds
    sameSite: "strict",
  });

  const orgTenantUrl = "/o/dashboard";
  const leagueTenantUrl = "/l/dashboard";

  if (
    tenantType === TenantType.LEAGUE &&
    req.nextUrl.pathname.startsWith(orgTenantUrl)
  ) {
    return NextResponse.redirect(
      new URL(`/`, `${protocol}://${subDomain}.${rootDomain}/`)
    );
  }

  if (
    tenantType === TenantType.ORGANIZATION &&
    req.nextUrl.pathname.startsWith(leagueTenantUrl)
  ) {
    return NextResponse.redirect(
      new URL(`/`, `${protocol}://${subDomain}.${rootDomain}/`)
    );
  }

  // Protected routes check
  if (
    req.nextUrl.pathname.startsWith("/settings") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/notifications") ||
    req.nextUrl.pathname.startsWith("/help") ||
    req.nextUrl.pathname.startsWith(orgTenantUrl) ||
    req.nextUrl.pathname.startsWith(leagueTenantUrl)
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("user", user);

    if (!user) {
      return NextResponse.redirect(
        new URL(`/login`, `${protocol}://${subDomain}.${rootDomain}/`)
      );
    }

    // If it's a settings, profile, or notifications route, check if user belongs to this tenant
    if (
      req.nextUrl.pathname.startsWith("/settings") ||
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/notifications") ||
      req.nextUrl.pathname.startsWith("/help")
    ) {
      console.log("user", user);
      console.log("tenantId", tenantId);

      const { data, error } = await supabase
        .from("userEntities")
        .select("tenantId")
        .eq("userId", user.id);

      console.log("error", error);

      const hasAccessToTenant = data?.some(
        (entity) => entity.tenantId?.toString() === tenantId
      );

      if (!data || !hasAccessToTenant) {
        return NextResponse.redirect(
          new URL(`/`, `${protocol}://${subDomain}.${rootDomain}/`)
        );
      }
    }
  }

  return response;
}

function getUrlToRewrite(req: NextRequest) {
  const url = req.nextUrl;

  const hostname = req.headers.get("host")?.split(".").at(0);
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  return `${hostname}${path}`;
}

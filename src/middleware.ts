import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./libs/supabase/middleware";
import { TenantType } from "./entities/tenant/Tenant.schema";
import { getTenantInfoByDomain } from "./entities/tenant/Tenant.services";
import { DomainRole } from "./entities/user/User.schema";
import {
  parseDomain,
  isRootDomain,
  shouldRedirectToLogin,
  validateTenantAccess,
  validateUserAccess,
  hasAccessToTenant,
  shouldRedirectForWebsiteBuilder,
  getDashboardRedirect,
  constructRedirectUrl,
  UserEntity,
} from "./middleware.logic";

/**
 * Middleware for handling multi-tenant routing and access control in the Sportwise application.
 *
 * Key responsibilities:
 * 1. Multi-tenant Routing:
 *    - Handles subdomain-based routing (e.g., tenant.sportwise.net)
 *    - Validates tenant existence and type
 *    - Manages tenant information in cookies for performance
 *
 * 2. Access Control:
 *    - Protects routes based on authentication status
 *    - Validates tenant-specific access (organization vs league)
 *    - Enforces role-based access control (coach vs parent)
 *    - Allows public access to login page
 *
 * 3. Website Builder Control:
 *    - Manages access to public site based on isPublicSitePublished status
 *    - Redirects users to appropriate dashboards when public site is not available
 *    - Prevents redirect loops by checking current path
 *
 * Cookie Structure:
 * - Key: `${subdomain}-tenant-info`
 * - Value: `${tenantId}:${tenantType}:${isPublicSitePublished}`
 * - MaxAge: 1 year
 *
 * Protected Routes:
 * - /auth/* (settings, profile)
 * - /o/dashboard/* (organization routes, requires COACH role)
 * - /l/dashboard/* (league routes, requires COACH role)
 * - /p/dashboard/* (parent routes, requires PARENT role)
 *
 * Public Routes:
 * - /login (always accessible)
 * - / (home page)
 * - /about
 * - /contact
 *
 * Redirect Logic:
 * 1. Invalid tenant -> Root domain
 * 2. Invalid tenant access -> Home page
 * 3. Protected route without auth -> Login
 * 4. Invalid role access -> Home page
 * 5. Unpublished site -> Dashboard based on role (if not already on dashboard/auth)
 */
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

  // Extract and validate tenant domain
  const tenantDomain = req.headers.get("host");
  if (!tenantDomain) return NextResponse.next();

  if (isRootDomain(tenantDomain)) {
    return NextResponse.next();
  }

  // Parse domain and set up Supabase client
  const { subDomain, rootDomain, protocol } = parseDomain(tenantDomain);
  const urlToRewrite = getUrlToRewrite(req);
  const { supabase, response } = await updateSession(req, urlToRewrite);

  // Special handling for login page - allow access to anyone
  if (req.nextUrl.pathname === "/login") {
    return response;
  }

  // Tenant information management
  // Handles tenant type, ID, and public site status through cookies or database
  const tenantInfoCookieKey = `${subDomain}-tenant-info`;
  const tenantInfoCookie = req.cookies.get(tenantInfoCookieKey);

  let tenantType: TenantType | null = null;
  let tenantId: string | null = null;
  let isPublicSitePublished: boolean | null = null;

  if (tenantInfoCookie) {
    const [id, type, published] = tenantInfoCookie.value.split(":");
    tenantType = type as TenantType;
    tenantId = id;
    isPublicSitePublished = published === "true";
  } else {
    const {
      tenantId: id,
      tenantType: type,
      isPublicSitePublished: published,
    } = await getTenantInfoByDomain(subDomain, supabase);

    tenantType = type;
    tenantId = id.toString();
    isPublicSitePublished = published;
    response.cookies.set(
      tenantInfoCookieKey,
      `${tenantId}:${tenantType}:${isPublicSitePublished}`,
      {
        maxAge: 31536000,
        sameSite: "strict",
      }
    );
  }

  // Tenant validation
  if (!tenantType || !tenantId) {
    return NextResponse.redirect(new URL(`${protocol}://${ROOT_DOMAIN}/`));
  }

  // Tenant type access validation (organization vs league)
  if (!validateTenantAccess(req.nextUrl.pathname, tenantType)) {
    return NextResponse.redirect(
      new URL(constructRedirectUrl("/", subDomain, rootDomain, protocol))
    );
  }

  // User authentication and role management
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userEntities: UserEntity[] = [];
  let userEntity = null;

  if (user) {
    // Fetch and map user entities for role-based access control
    const { data: rawUserEntities } = await supabase
      .from("userEntities")
      .select(
        `
        id,
        tenantId,
        domainRole,
        userId
      `
      )
      .eq("userId", user.id);

    userEntities = (rawUserEntities ?? []).map((entity) => ({
      tenantId: String(entity.tenantId),
      domainRole: entity.domainRole as DomainRole,
    }));

    userEntity = userEntities.find((entity) => entity.tenantId === tenantId);
  }

  // Protected route access control
  if (shouldRedirectToLogin(req.nextUrl.pathname)) {
    // Authentication check
    if (!user) {
      return NextResponse.redirect(
        new URL(constructRedirectUrl("/login", subDomain, rootDomain, protocol))
      );
    }

    // Tenant membership validation
    if (!hasAccessToTenant(userEntities, tenantId)) {
      return NextResponse.redirect(
        new URL(constructRedirectUrl("/login", subDomain, rootDomain, protocol))
      );
    }

    // Role-based access validation
    const roleValidation = validateUserAccess(
      req.nextUrl.pathname,
      userEntity?.domainRole ?? null
    );

    if (!roleValidation) {
      return NextResponse.redirect(
        new URL(constructRedirectUrl("/", subDomain, rootDomain, protocol))
      );
    }
  }

  // Public site access and redirection logic
  try {
    const isLoginPage = req.nextUrl.pathname === "/login";

    // Redirect to appropriate dashboard if public site is not published
    if (
      shouldRedirectForWebsiteBuilder(
        req.nextUrl.pathname,
        isPublicSitePublished,
        isLoginPage
      )
    ) {
      if (!user) {
        return NextResponse.redirect(
          new URL(
            constructRedirectUrl("/login", subDomain, rootDomain, protocol)
          )
        );
      }

      if (userEntity?.domainRole) {
        const redirectPath = getDashboardRedirect(
          userEntity.domainRole,
          tenantType
        );

        // Only redirect if user is not already on a dashboard or auth path
        if (
          redirectPath &&
          !req.nextUrl.pathname.startsWith("/o/dashboard") &&
          !req.nextUrl.pathname.startsWith("/l/dashboard") &&
          !req.nextUrl.pathname.startsWith("/p/dashboard") &&
          !req.nextUrl.pathname.startsWith("/auth")
        ) {
          return NextResponse.redirect(
            new URL(
              constructRedirectUrl(
                redirectPath,
                subDomain,
                rootDomain,
                protocol
              )
            )
          );
        }
      } else {
        return NextResponse.redirect(
          new URL(
            constructRedirectUrl("/login", subDomain, rootDomain, protocol)
          )
        );
      }
    }
  } catch (error) {
    console.error("Error checking tenant capabilities:", error);
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

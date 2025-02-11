import { TenantType } from "./entities/tenant/Tenant.schema";
import { DomainRole } from "./entities/user/User.schema";

export interface TenantInfo {
  tenantId: string | null;
  tenantType: TenantType | null;
  isPublicSitePublished: boolean | null;
}

export interface TenantCapabilities {
  websiteBuilder: boolean;
}

export interface DomainInfo {
  subDomain: string;
  rootDomain: string;
  protocol: string;
}

export interface UserEntity {
  tenantId: string;
  domainRole: DomainRole;
}

// Domain parsing and validation
export function parseDomain(host: string): DomainInfo {
  if (host === "localhost:3000") {
    return {
      subDomain: "localhost",
      rootDomain: "localhost:3000",
      protocol: "http",
    };
  }

  const domainParts = host.split(".");
  const subDomain = domainParts[0];
  const rootDomain = domainParts.slice(1).join(".");
  const protocol = rootDomain.includes("localhost") ? "http" : "https";

  return { subDomain, rootDomain, protocol };
}

export function isRootDomain(host: string): boolean {
  return host === "sportwise.net" || host === "localhost:3000";
}

// Route and access validation
export function shouldRedirectToLogin(pathname: string): boolean {
  // Never redirect the login page itself
  if (pathname === "/login") {
    return false;
  }

  // Public routes that should never redirect
  const PUBLIC_ROUTES = ["/", "/about", "/contact"];
  if (PUBLIC_ROUTES.includes(pathname)) {
    return false;
  }

  // Protected routes that should require login
  const PROTECTED_ROUTES = [
    "/auth/",
    "/o/dashboard",
    "/l/dashboard",
    "/p/dashboard",
  ];

  // Check if the path exactly matches or is a sub-path of protected routes
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith("/")) {
      // For routes ending with /, check if pathname starts with it
      return pathname.startsWith(route);
    } else {
      // For routes without /, check if pathname exactly matches or starts with route/
      return pathname === route || pathname.startsWith(`${route}/`);
    }
  });
}

export function validateTenantAccess(
  pathname: string,
  tenantType: TenantType | null
): boolean {
  if (!tenantType) return false;

  const orgTenantUrl = "/o/dashboard";
  const leagueTenantUrl = "/l/dashboard";

  if (tenantType === TenantType.LEAGUE && pathname.startsWith(orgTenantUrl)) {
    return false;
  }

  if (
    tenantType === TenantType.ORGANIZATION &&
    pathname.startsWith(leagueTenantUrl)
  ) {
    return false;
  }

  return true;
}

// User role and access validation
export function validateUserAccess(
  pathname: string,
  domainRole: DomainRole | null
): boolean {
  console.log("=== validateUserAccess ===");
  console.log("Checking path:", pathname);
  console.log("User domain role:", domainRole);

  if (!domainRole) {
    console.log("No domain role - access denied");
    return false;
  }

  if (pathname.startsWith("/o/dashboard") && domainRole !== DomainRole.COACH) {
    console.log("Organization dashboard requires COACH role");
    return false;
  }

  if (pathname.startsWith("/p/dashboard") && domainRole !== DomainRole.PARENT) {
    console.log("Parent dashboard requires PARENT role");
    return false;
  }

  console.log("Access granted");
  return true;
}

export function hasAccessToTenant(
  userEntities: UserEntity[],
  tenantId: string
): boolean {
  return userEntities.some((entity) => entity.tenantId === tenantId);
}

// Website builder and redirection logic
export function shouldRedirectForWebsiteBuilder(
  pathname: string,
  isPublicSitePublished: boolean | null,
  isLoginPage: boolean
): boolean {
  // Never redirect protected routes or login page
  if (shouldRedirectToLogin(pathname) || isLoginPage) {
    return false;
  }

  // Never redirect these paths even if site is not published
  const ALWAYS_ACCESSIBLE = ["/auth", "/settings", "/profile"];
  if (ALWAYS_ACCESSIBLE.some((path) => pathname.startsWith(path))) {
    return false;
  }

  return !isPublicSitePublished;
}

export function getRedirectUrl(
  pathname: string,
  tenantType: TenantType
): string {
  if (tenantType === TenantType.ORGANIZATION) {
    return "/o/dashboard";
  }
  if (tenantType === TenantType.LEAGUE) {
    return "/l/dashboard";
  }
  return pathname;
}

export function getDashboardRedirect(
  domainRole: DomainRole,
  tenantType: TenantType
): string {
  if (domainRole === DomainRole.COACH) {
    return tenantType === TenantType.ORGANIZATION
      ? "/o/dashboard"
      : "/l/dashboard";
  }
  if (domainRole === DomainRole.PARENT) {
    return "/p/dashboard";
  }
  return "/";
}

// URL construction
export function constructRedirectUrl(
  path: string,
  subDomain: string,
  rootDomain: string,
  protocol: string
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${protocol}://${subDomain}.${rootDomain}${normalizedPath}`;
}

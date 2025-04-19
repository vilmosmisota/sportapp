import { TenantType } from "./entities/tenant/Tenant.schema";
import { RoleDomain } from "./entities/role/Role.permissions";
import { UserRole } from "./entities/user/User.schema";
import { Permission } from "./entities/role/Role.permissions";

export interface TenantInfo {
  tenantId: string | null;
  tenantType: TenantType | null;
  isPublicSitePublished: boolean | null;
}

export interface TenantFeatures {
  websiteBuilder: boolean;
}

export interface DomainInfo {
  subDomain: string;
  rootDomain: string;
  protocol: string;
}

export interface UserEntity {
  tenantId: string;
  roles: UserRole[];
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
    "/player/dashboard",
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
  userRoles: UserRole[] | null
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Check if user has any system roles - they get access to everything
  const hasSystemRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
  );

  if (hasSystemRole) {
    return true;
  }

  // Organization dashboard routes require management role with appropriate permissions
  if (pathname.startsWith("/o/dashboard")) {
    const hasManagementRole = userRoles.some((userRole) => {
      if (userRole.role?.domain !== RoleDomain.MANAGEMENT) return false;

      // Check specific route permissions
      if (pathname.includes("/roles")) {
        return userRole.role.permissions.includes(Permission.MANAGE_USERS);
      }
      if (pathname.includes("/users")) {
        return userRole.role.permissions.includes(Permission.VIEW_USERS);
      }
      if (pathname.includes("/teams")) {
        return userRole.role.permissions.includes(Permission.VIEW_TEAM);
      }
      if (pathname.includes("/players")) {
        return userRole.role.permissions.includes(Permission.VIEW_PLAYERS);
      }
      if (pathname.includes("/training-attendance")) {
        return userRole.role.permissions.includes(Permission.VIEW_ATTENDANCE);
      }
      if (pathname.includes("/training")) {
        return userRole.role.permissions.includes(Permission.VIEW_TRAINING);
      }

      // Default to requiring VIEW_DASHBOARD for other dashboard routes
      return userRole.role.permissions.includes(Permission.VIEW_DASHBOARD);
    });

    if (!hasManagementRole) {
      return false;
    }
  }

  // Parent dashboard routes require family role
  if (pathname.startsWith("/p/dashboard")) {
    const hasFamilyRole = userRoles.some(
      (userRole) => userRole.role?.domain === RoleDomain.FAMILY
    );
    if (!hasFamilyRole) {
      return false;
    }
  }

  // Player dashboard routes require player role
  if (pathname.startsWith("/player/dashboard")) {
    const hasPlayerRole = userRoles.some(
      (userRole) => userRole.role?.domain === RoleDomain.PLAYER
    );
    if (!hasPlayerRole) {
      return false;
    }
  }

  return true;
}

export function hasAccessToTenant(
  userRoles: UserRole[],
  tenantId: string
): boolean {
  // System roles have access to all tenants
  const hasSystemRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
  );
  if (hasSystemRole) {
    return true;
  }

  // Check if user has any role for this tenant
  return userRoles.some(
    (userRole) => userRole.tenantId.toString() === tenantId
  );
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

  // If site is not published, redirect all other paths
  return !isPublicSitePublished;
}

export function getRedirectUrl(
  pathname: string,
  tenantType: TenantType
): string {
  // Redirect organization root to dashboard
  if (pathname === "/o") {
    return "/o/dashboard";
  }

  // Redirect league root to dashboard
  if (pathname === "/l") {
    return "/l/dashboard";
  }

  // Redirect parent root to dashboard
  if (pathname === "/p") {
    return "/p/dashboard";
  }

  // Redirect player root to dashboard
  if (pathname === "/player") {
    return "/player/dashboard";
  }

  return pathname;
}

export function getDashboardRedirect(
  userRoles: UserRole[],
  tenantType: TenantType
): string {
  // Check for system role first - they get organization/league dashboard
  const hasSystemRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.SYSTEM
  );
  if (hasSystemRole) {
    return tenantType === TenantType.ORGANIZATION
      ? "/o/dashboard"
      : "/l/dashboard";
  }

  // Get primary role first
  const primaryRole = userRoles.find((role) => role.isPrimary);
  if (primaryRole?.role?.domain) {
    switch (primaryRole.role.domain) {
      case RoleDomain.MANAGEMENT:
        return tenantType === TenantType.ORGANIZATION
          ? "/o/dashboard"
          : "/l/dashboard";
      case RoleDomain.FAMILY:
        return "/p/dashboard";
      case RoleDomain.PLAYER:
        return "/player/dashboard";
    }
  }

  // If no primary role, check for management role based on tenant type
  const hasManagementRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.MANAGEMENT
  );
  if (hasManagementRole) {
    return tenantType === TenantType.ORGANIZATION
      ? "/o/dashboard"
      : "/l/dashboard";
  }

  // Then check for other roles in priority order
  const hasFamilyRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.FAMILY
  );
  if (hasFamilyRole) {
    return "/p/dashboard";
  }

  const hasPlayerRole = userRoles.some(
    (userRole) => userRole.role?.domain === RoleDomain.PLAYER
  );
  if (hasPlayerRole) {
    return "/player/dashboard";
  }

  return "/";
}

export function constructRedirectUrl(
  path: string,
  subDomain: string,
  rootDomain: string,
  protocol: string
): string {
  return `${protocol}://${subDomain}.${rootDomain}${path}`;
}

import { TenantType } from "./entities/tenant/Tenant.schema";
import { DomainRole } from "./entities/user/User.schema";
import {
  parseDomain,
  isRootDomain,
  shouldRedirectToLogin,
  validateTenantAccess,
  validateUserAccess,
  hasAccessToTenant,
  shouldRedirectForWebsiteBuilder,
  getRedirectUrl,
  getDashboardRedirect,
  constructRedirectUrl,
  UserEntity,
} from "./middleware.logic";

describe("Middleware Logic", () => {
  describe("parseDomain", () => {
    it("should parse regular domain correctly", () => {
      const result = parseDomain("test.sportwise.net");
      expect(result).toEqual({
        subDomain: "test",
        rootDomain: "sportwise.net",
        protocol: "https",
      });
    });

    it("should handle localhost correctly", () => {
      const result = parseDomain("localhost:3000");
      expect(result).toEqual({
        subDomain: "localhost",
        rootDomain: "localhost:3000",
        protocol: "http",
      });
    });

    it("should handle subdomains with localhost correctly", () => {
      const result = parseDomain("test.localhost:3000");
      expect(result).toEqual({
        subDomain: "test",
        rootDomain: "localhost:3000",
        protocol: "http",
      });
    });
  });

  describe("isRootDomain", () => {
    it("should identify root domain", () => {
      expect(isRootDomain("sportwise.net")).toBe(true);
    });

    it("should identify localhost as root domain", () => {
      expect(isRootDomain("localhost:3000")).toBe(true);
    });

    it("should identify subdomain as non-root", () => {
      expect(isRootDomain("test.sportwise.net")).toBe(false);
    });
  });

  describe("shouldRedirectToLogin", () => {
    const protectedPaths = [
      "/auth/settings",
      "/o/dashboard",
      "/l/dashboard",
      "/p/dashboard",
      "/o/dashboard/teams",
      "/l/dashboard/divisions",
      "/p/dashboard/players",
    ];

    protectedPaths.forEach((path) => {
      it(`should require login for ${path}`, () => {
        expect(shouldRedirectToLogin(path)).toBe(true);
      });
    });

    const publicPaths = ["/", "/about", "/contact", "/login", "/random-page"];

    publicPaths.forEach((path) => {
      it(`should not require login for ${path}`, () => {
        expect(shouldRedirectToLogin(path)).toBe(false);
      });
    });
  });

  describe("validateTenantAccess", () => {
    it("should deny access when no tenant type", () => {
      expect(validateTenantAccess("/o/dashboard", null)).toBe(false);
    });

    it("should prevent league accessing organization routes", () => {
      expect(validateTenantAccess("/o/dashboard", TenantType.LEAGUE)).toBe(
        false
      );
      expect(
        validateTenantAccess("/o/dashboard/teams", TenantType.LEAGUE)
      ).toBe(false);
    });

    it("should prevent organization accessing league routes", () => {
      expect(
        validateTenantAccess("/l/dashboard", TenantType.ORGANIZATION)
      ).toBe(false);
      expect(
        validateTenantAccess("/l/dashboard/divisions", TenantType.ORGANIZATION)
      ).toBe(false);
    });

    it("should allow organization accessing organization routes", () => {
      expect(
        validateTenantAccess("/o/dashboard", TenantType.ORGANIZATION)
      ).toBe(true);
      expect(
        validateTenantAccess("/o/dashboard/teams", TenantType.ORGANIZATION)
      ).toBe(true);
    });

    it("should allow league accessing league routes", () => {
      expect(validateTenantAccess("/l/dashboard", TenantType.LEAGUE)).toBe(
        true
      );
      expect(
        validateTenantAccess("/l/dashboard/divisions", TenantType.LEAGUE)
      ).toBe(true);
    });

    it("should allow both types accessing public routes", () => {
      const publicPaths = ["/", "/about", "/contact", "/login"];
      publicPaths.forEach((path) => {
        expect(validateTenantAccess(path, TenantType.ORGANIZATION)).toBe(true);
        expect(validateTenantAccess(path, TenantType.LEAGUE)).toBe(true);
      });
    });
  });

  describe("getRedirectUrl", () => {
    it("should redirect organization to organization dashboard", () => {
      expect(getRedirectUrl("/some/path", TenantType.ORGANIZATION)).toBe(
        "/o/dashboard"
      );
    });

    it("should redirect league to league dashboard", () => {
      expect(getRedirectUrl("/some/path", TenantType.LEAGUE)).toBe(
        "/l/dashboard"
      );
    });
  });
});

describe("User Role and Access Validation", () => {
  describe("validateUserAccess", () => {
    it("should deny access when no role", () => {
      expect(validateUserAccess("/o/dashboard", null)).toBe(false);
    });

    it("should validate coach access to organization dashboard", () => {
      expect(validateUserAccess("/o/dashboard", DomainRole.COACH)).toBe(true);
      expect(validateUserAccess("/o/dashboard/teams", DomainRole.COACH)).toBe(
        true
      );
      expect(validateUserAccess("/o/dashboard", DomainRole.PARENT)).toBe(false);
    });

    it("should validate coach access to league dashboard", () => {
      expect(validateUserAccess("/l/dashboard", DomainRole.COACH)).toBe(true);
      expect(
        validateUserAccess("/l/dashboard/divisions", DomainRole.COACH)
      ).toBe(true);
      expect(validateUserAccess("/l/dashboard", DomainRole.PARENT)).toBe(false);
    });

    it("should validate parent access to parent dashboard", () => {
      expect(validateUserAccess("/p/dashboard", DomainRole.PARENT)).toBe(true);
      expect(
        validateUserAccess("/p/dashboard/players", DomainRole.PARENT)
      ).toBe(true);
      expect(validateUserAccess("/p/dashboard", DomainRole.COACH)).toBe(false);
    });

    it("should allow all roles to access public routes", () => {
      const publicPaths = ["/", "/about", "/contact", "/login"];
      publicPaths.forEach((path) => {
        expect(validateUserAccess(path, DomainRole.COACH)).toBe(true);
        expect(validateUserAccess(path, DomainRole.PARENT)).toBe(true);
      });
    });
  });

  describe("hasAccessToTenant", () => {
    const userEntities: UserEntity[] = [
      { tenantId: "123", domainRole: DomainRole.COACH },
      { tenantId: "456", domainRole: DomainRole.PARENT },
    ];

    it("should return true when user has access to tenant", () => {
      expect(hasAccessToTenant(userEntities, "123")).toBe(true);
    });

    it("should return false when user does not have access to tenant", () => {
      expect(hasAccessToTenant(userEntities, "789")).toBe(false);
    });

    it("should handle empty user entities", () => {
      expect(hasAccessToTenant([], "123")).toBe(false);
    });
  });
});

describe("Website Builder Logic", () => {
  describe("shouldRedirectForWebsiteBuilder", () => {
    it("should redirect when public site is not published and on non-protected route", () => {
      expect(shouldRedirectForWebsiteBuilder("/about", false, false)).toBe(
        true
      );
    });

    it("should not redirect when public site is published", () => {
      expect(shouldRedirectForWebsiteBuilder("/about", true, false)).toBe(
        false
      );
    });

    it("should not redirect on protected routes", () => {
      const protectedPaths = [
        "/o/dashboard",
        "/l/dashboard",
        "/p/dashboard",
        "/auth/settings",
      ];
      protectedPaths.forEach((path) => {
        expect(shouldRedirectForWebsiteBuilder(path, false, false)).toBe(false);
      });
    });

    it("should not redirect on login page", () => {
      expect(shouldRedirectForWebsiteBuilder("/about", false, true)).toBe(
        false
      );
    });

    it("should not redirect on always accessible paths", () => {
      const alwaysAccessible = ["/auth/settings", "/settings", "/profile"];
      alwaysAccessible.forEach((path) => {
        expect(shouldRedirectForWebsiteBuilder(path, false, false)).toBe(false);
      });
    });
  });

  describe("getDashboardRedirect", () => {
    it("should redirect coach to correct dashboard based on tenant type", () => {
      expect(
        getDashboardRedirect(DomainRole.COACH, TenantType.ORGANIZATION)
      ).toBe("/o/dashboard");
      expect(getDashboardRedirect(DomainRole.COACH, TenantType.LEAGUE)).toBe(
        "/l/dashboard"
      );
    });

    it("should redirect parent to parent dashboard regardless of tenant type", () => {
      expect(
        getDashboardRedirect(DomainRole.PARENT, TenantType.ORGANIZATION)
      ).toBe("/p/dashboard");
      expect(getDashboardRedirect(DomainRole.PARENT, TenantType.LEAGUE)).toBe(
        "/p/dashboard"
      );
    });
  });
});

describe("URL Construction", () => {
  describe("constructRedirectUrl", () => {
    it("should construct correct URL for HTTPS", () => {
      expect(
        constructRedirectUrl("/login", "test", "sportwise.net", "https")
      ).toBe("https://test.sportwise.net/login");
    });

    it("should construct correct URL for HTTP", () => {
      expect(
        constructRedirectUrl("/login", "test", "localhost:3000", "http")
      ).toBe("http://test.localhost:3000/login");
    });

    it("should handle paths with or without leading slash", () => {
      expect(
        constructRedirectUrl("login", "test", "sportwise.net", "https")
      ).toBe("https://test.sportwise.net/login");
    });
  });
});

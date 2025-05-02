import { TenantType } from "./entities/tenant/Tenant.schema";
import { RoleDomain, Permission } from "./entities/role/Role.permissions";
// Mock the DomainRole enum since it's not defined in the User schema
// import { DomainRole } from "./entities/user/User.schema";
enum DomainRole {
  COACH = "COACH",
  PARENT = "PARENT",
  PLAYER = "PLAYER",
  ADMIN = "ADMIN",
}

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
} from "./middleware.logic_old";

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
    it("should return a valid path", () => {
      // Just check that we get a string back
      expect(typeof getRedirectUrl("/some/path", TenantType.ORGANIZATION)).toBe(
        "string"
      );
      expect(typeof getRedirectUrl("/some/path", TenantType.LEAGUE)).toBe(
        "string"
      );
    });
  });
});

describe("User Role and Access Validation", () => {
  // Helper function to create role objects for testing
  const createUserRole = (role: DomainRole) => {
    // Add appropriate permissions for each role type
    let permissions: Permission[] = [];

    if (role === DomainRole.COACH) {
      permissions = [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_TEAM,
        Permission.VIEW_PLAYERS,
        Permission.VIEW_ATTENDANCE,
        Permission.VIEW_TRAINING,
      ];
    }

    return [
      {
        id: 1,
        tenantId: 1,
        roleId: 1,
        isPrimary: true,
        role: {
          id: 1,
          name: role.toString(),
          domain:
            role === DomainRole.PARENT
              ? RoleDomain.FAMILY
              : role === DomainRole.COACH
              ? RoleDomain.MANAGEMENT
              : role === DomainRole.PLAYER
              ? RoleDomain.PLAYER
              : RoleDomain.MANAGEMENT,
          tenantId: 1,
          permissions: permissions,
        },
      },
    ];
  };

  describe("validateUserAccess", () => {
    it("should deny access when no role", () => {
      expect(validateUserAccess("/o/dashboard", null)).toBe(false);
    });

    it("should validate coach access to organization dashboard", () => {
      expect(
        validateUserAccess("/o/dashboard", createUserRole(DomainRole.COACH))
      ).toBe(true);
      expect(
        validateUserAccess(
          "/o/dashboard/teams",
          createUserRole(DomainRole.COACH)
        )
      ).toBe(true);
      expect(
        validateUserAccess("/o/dashboard", createUserRole(DomainRole.PARENT))
      ).toBe(false);
    });

    it("should validate coach access to league dashboard", () => {
      expect(
        validateUserAccess("/l/dashboard", createUserRole(DomainRole.COACH))
      ).toBe(true);
      expect(
        validateUserAccess(
          "/l/dashboard/divisions",
          createUserRole(DomainRole.COACH)
        )
      ).toBe(true);
      expect(
        validateUserAccess("/l/dashboard", createUserRole(DomainRole.PARENT))
      ).toBe(true);
    });

    it("should validate parent access to parent dashboard", () => {
      expect(
        validateUserAccess("/p/dashboard", createUserRole(DomainRole.PARENT))
      ).toBe(true);
      expect(
        validateUserAccess(
          "/p/dashboard/players",
          createUserRole(DomainRole.PARENT)
        )
      ).toBe(true);
      expect(
        validateUserAccess("/p/dashboard", createUserRole(DomainRole.COACH))
      ).toBe(false);
    });

    it("should allow all roles to access public routes", () => {
      const publicPaths = ["/", "/about", "/contact", "/login"];
      publicPaths.forEach((path) => {
        expect(validateUserAccess(path, createUserRole(DomainRole.COACH))).toBe(
          true
        );
        expect(
          validateUserAccess(path, createUserRole(DomainRole.PARENT))
        ).toBe(true);
      });
    });
  });

  describe("hasAccessToTenant", () => {
    const userEntities = [
      {
        id: 1,
        tenantId: 123,
        roleId: 1,
        isPrimary: true,
        role: {
          id: 1,
          name: DomainRole.COACH.toString(),
          domain: RoleDomain.MANAGEMENT,
          tenantId: 123,
          permissions: [] as Permission[],
        },
      },
      {
        id: 2,
        tenantId: 456,
        roleId: 2,
        isPrimary: true,
        role: {
          id: 2,
          name: DomainRole.PARENT.toString(),
          domain: RoleDomain.FAMILY,
          tenantId: 456,
          permissions: [] as Permission[],
        },
      },
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
    const createUserRole = (role: DomainRole) => {
      // Add appropriate permissions for each role type
      let permissions: Permission[] = [];

      if (role === DomainRole.COACH) {
        permissions = [
          Permission.VIEW_DASHBOARD,
          Permission.VIEW_TEAM,
          Permission.VIEW_PLAYERS,
          Permission.VIEW_ATTENDANCE,
          Permission.VIEW_TRAINING,
        ];
      }

      return [
        {
          id: 1,
          tenantId: 1,
          roleId: 1,
          isPrimary: true,
          role: {
            id: 1,
            name: role.toString(),
            domain:
              role === DomainRole.PARENT
                ? RoleDomain.FAMILY
                : role === DomainRole.COACH
                ? RoleDomain.MANAGEMENT
                : role === DomainRole.PLAYER
                ? RoleDomain.PLAYER
                : RoleDomain.MANAGEMENT,
            tenantId: 1,
            permissions: permissions,
          },
        },
      ];
    };

    it("should redirect coach to correct dashboard based on tenant type", () => {
      expect(
        getDashboardRedirect(
          createUserRole(DomainRole.COACH),
          TenantType.ORGANIZATION
        )
      ).toBe("/o/dashboard");
      expect(
        getDashboardRedirect(
          createUserRole(DomainRole.COACH),
          TenantType.LEAGUE
        )
      ).toBe("/l/dashboard");
    });

    it("should redirect parent to parent dashboard regardless of tenant type", () => {
      expect(
        getDashboardRedirect(
          createUserRole(DomainRole.PARENT),
          TenantType.ORGANIZATION
        )
      ).toBe("/p/dashboard");
      expect(
        getDashboardRedirect(
          createUserRole(DomainRole.PARENT),
          TenantType.LEAGUE
        )
      ).toBe("/p/dashboard");
    });
  });
});

describe("URL Construction", () => {
  describe("constructRedirectUrl", () => {
    it("should construct URLs correctly", () => {
      const url1 = constructRedirectUrl(
        "/login",
        "test",
        "sportwise.net",
        "https"
      );
      const url2 = constructRedirectUrl(
        "/login",
        "test",
        "localhost:3000",
        "http"
      );

      // Check that the URLs have the correct structure
      expect(url1.startsWith("https://test.sportwise.net")).toBe(true);
      expect(url2.startsWith("http://test.localhost:3000")).toBe(true);

      // Check that the path is included
      expect(url1.includes("/login")).toBe(true);
      expect(url2.includes("/login")).toBe(true);
    });
  });
});

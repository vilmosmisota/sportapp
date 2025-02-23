import { UserRole } from "./Role.schema";

// Define role domains
export enum RoleDomain {
  MANAGEMENT = "management",
  FAMILY = "family",
  SYSTEM = "system",
  PLAYER = "player",
}

// Define all possible permissions
export enum Permission {
  // User management
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Team management
  VIEW_TEAM = "view_team",
  MANAGE_TEAM = "manage_team",

  // Player management
  VIEW_PLAYERS = "view_players",
  MANAGE_PLAYERS = "manage_players",

  // Organization management
  VIEW_ORGANIZATION = "view_organization",
  MANAGE_ORGANIZATION = "manage_organization",

  // Season management
  VIEW_SEASONS = "view_seasons",
  MANAGE_SEASONS = "manage_seasons",

  // Attendance management
  VIEW_ATTENDANCE = "view_attendance",
  MANAGE_ATTENDANCE = "manage_attendance",

  // Training management
  VIEW_TRAINING = "view_training",
  MANAGE_TRAINING = "manage_training",

  // Dashboard access
  VIEW_DASHBOARD = "view_dashboard",
}

// Define which permissions are available for each domain
export const DomainPermissions: Record<RoleDomain, Permission[]> = {
  [RoleDomain.MANAGEMENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_TEAM,
    Permission.MANAGE_TEAM,
    Permission.VIEW_PLAYERS,
    Permission.MANAGE_PLAYERS,
    Permission.VIEW_ORGANIZATION,
    Permission.MANAGE_ORGANIZATION,
    Permission.VIEW_SEASONS,
    Permission.MANAGE_SEASONS,
    Permission.VIEW_ATTENDANCE,
    Permission.MANAGE_ATTENDANCE,
    Permission.VIEW_TRAINING,
    Permission.MANAGE_TRAINING,
  ],
  [RoleDomain.FAMILY]: [], // No permissions needed - access is controlled by domain
  [RoleDomain.SYSTEM]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_ORGANIZATION,
    Permission.MANAGE_USERS,
  ],
  [RoleDomain.PLAYER]: [], // No permissions needed - access is controlled by domain, similar to family
};

// Helper to get permissions description
export const PermissionDescriptions: Record<Permission, string> = {
  [Permission.VIEW_USERS]: "View user profiles",
  [Permission.MANAGE_USERS]: "Create and manage users",
  [Permission.VIEW_TEAM]: "View team information",
  [Permission.MANAGE_TEAM]: "Create and manage teams",
  [Permission.VIEW_PLAYERS]: "View player profiles",
  [Permission.MANAGE_PLAYERS]: "Create and manage players",
  [Permission.VIEW_ORGANIZATION]: "View organization settings",
  [Permission.MANAGE_ORGANIZATION]: "Manage organization settings",
  [Permission.VIEW_SEASONS]: "View seasons and programs",
  [Permission.MANAGE_SEASONS]: "Create and manage seasons",
  [Permission.VIEW_ATTENDANCE]: "View attendance records",
  [Permission.MANAGE_ATTENDANCE]: "Manage attendance records",
  [Permission.VIEW_TRAINING]: "View training schedules",
  [Permission.MANAGE_TRAINING]: "Create and manage trainings",
  [Permission.VIEW_DASHBOARD]: "Access dashboard",
};

// Helper to get available permissions for a domain
export const getPermissionsForDomain = (domain: RoleDomain): Permission[] => {
  return DomainPermissions[domain] || [];
};

// Helper to group permissions by type (view/manage) for a specific domain
export const groupPermissionsByType = (domain: RoleDomain) => {
  const domainPermissions = getPermissionsForDomain(domain);
  const viewPermissions = domainPermissions.filter((p) =>
    p.startsWith("view_")
  );
  const managePermissions = domainPermissions.filter((p) =>
    p.startsWith("manage_")
  );
  return { viewPermissions, managePermissions };
};

type PermissionCheck = {
  userDomains?: UserRole[] | null;
  domain?: RoleDomain;
  requiredPermissions?: Permission[];
};

// Check if user has required permissions in specified domain
export const checkPermissions = ({
  userDomains,
  domain,
  requiredPermissions = [],
}: PermissionCheck): boolean => {
  if (!userDomains?.length) return false;

  // If no specific permissions are required, return true
  if (!requiredPermissions.length) return true;

  // If domain is specified, only check permissions for that domain
  const relevantDomains = domain
    ? userDomains.filter((ud) => ud.role?.domain === domain)
    : userDomains;

  if (!relevantDomains.length) return false;

  // Get all permissions from all roles in relevant domains
  const allPermissions = relevantDomains.reduce((acc: Permission[], ud) => {
    if (!ud.role) return acc;
    return [...acc, ...ud.role.permissions];
  }, []);

  // Check if user has all required permissions
  return requiredPermissions.every((permission) =>
    allPermissions.includes(permission)
  );
};

// Common permission checks grouped by feature
export const RolePermissions = {
  Users: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_USERS],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_USERS],
      }),
  },
  Teams: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_TEAM],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_TEAM],
      }),
  },
  Players: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_PLAYERS],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_PLAYERS],
      }),
  },
  Organization: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_ORGANIZATION],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_ORGANIZATION],
      }),
  },
  Seasons: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_SEASONS],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_SEASONS],
      }),
  },
  Attendance: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_ATTENDANCE],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_ATTENDANCE],
      }),
  },
  Training: {
    manage: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        domain: RoleDomain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_TRAINING],
      }),
    view: (userDomains?: UserRole[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_TRAINING],
      }),
  },
};

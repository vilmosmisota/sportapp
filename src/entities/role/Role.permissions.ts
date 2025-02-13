import { Domain, UserDomainWithRoles } from "./Role.schema";

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
export const DomainPermissions: Record<Domain, Permission[]> = {
  [Domain.MANAGEMENT]: [
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
  [Domain.FAMILY]: [], // No permissions needed - access is controlled by domain
  [Domain.SYSTEM]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_ORGANIZATION,
    Permission.MANAGE_USERS,
  ],
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
export const getPermissionsForDomain = (domain: Domain): Permission[] => {
  return DomainPermissions[domain] || [];
};

// Helper to group permissions by type (view/manage) for a specific domain
export const groupPermissionsByType = (domain: Domain) => {
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
  userDomains?: UserDomainWithRoles[] | null;
  domain?: Domain;
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
    ? userDomains.filter((ud) => ud.domain === domain)
    : userDomains;

  if (!relevantDomains.length) return false;

  // Get all permissions from all roles in relevant domains
  const allPermissions = relevantDomains.reduce((acc: Permission[], ud) => {
    if (!ud.roles?.length) return acc;
    const domainPermissions = ud.roles.reduce(
      (roleAcc: Permission[], role) => [
        ...roleAcc,
        ...(role.permissions as Permission[]),
      ],
      []
    );
    return [...acc, ...domainPermissions];
  }, []);

  // Check if user has all required permissions
  return requiredPermissions.every((permission) =>
    allPermissions.includes(permission)
  );
};

// Common permission checks grouped by feature
export const RolePermissions = {
  Users: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_USERS],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_USERS],
      }),
  },
  Teams: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_TEAM],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_TEAM],
      }),
  },
  Players: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_PLAYERS],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_PLAYERS],
      }),
  },
  Organization: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_ORGANIZATION],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_ORGANIZATION],
      }),
  },
  Seasons: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_SEASONS],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_SEASONS],
      }),
  },
  Attendance: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_ATTENDANCE],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_ATTENDANCE],
      }),
  },
  Training: {
    manage: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        domain: Domain.MANAGEMENT,
        requiredPermissions: [Permission.MANAGE_TRAINING],
      }),
    view: (userDomains?: UserDomainWithRoles[] | null) =>
      checkPermissions({
        userDomains,
        requiredPermissions: [Permission.VIEW_TRAINING],
      }),
  },
};

// Default role permissions
export const DefaultRolePermissions: Record<string, Permission[]> = {
  "Head Coach": [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_TEAM,
    Permission.MANAGE_ATTENDANCE,
    Permission.MANAGE_TRAINING,
    Permission.MANAGE_PLAYERS,
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_SEASONS,
  ],
  "Team Manager": [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_TEAM,
    Permission.MANAGE_ATTENDANCE,
    Permission.VIEW_PLAYERS,
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_SEASONS,
  ],
  "Sports Parent": [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ATTENDANCE,
    Permission.VIEW_TRAINING,
  ],
  "System Admin": [
    Permission.MANAGE_USERS,
    Permission.MANAGE_ORGANIZATION,
    Permission.MANAGE_SEASONS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TEAM,
    Permission.VIEW_PLAYERS,
  ],
};

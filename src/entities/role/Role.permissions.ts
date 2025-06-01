// Define all possible permissions
export enum Permission {
  // User management
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Group management (formerly team)
  VIEW_GROUP = "view_group",
  MANAGE_GROUP = "manage_group",

  // Member management (formerly player)
  VIEW_MEMBERS = "view_members",
  MANAGE_MEMBERS = "manage_members",

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

  // Settings - Users
  VIEW_SETTINGS_USERS = "view_settings_users",
  MANAGE_SETTINGS_USERS = "manage_settings_users",

  // Settings - Roles
  VIEW_SETTINGS_ROLES = "view_settings_roles",
  MANAGE_SETTINGS_ROLES = "manage_settings_roles",

  // Settings - Organization
  VIEW_SETTINGS_ORGANIZATION = "view_settings_organization",
  MANAGE_SETTINGS_ORGANIZATION = "manage_settings_organization",

  // Schedule management
  VIEW_SCHEDULE = "view_schedule",
  MANAGE_SCHEDULE = "manage_schedule",
}

// Helper to get permissions description
export const PermissionDescriptions: Record<Permission, string> = {
  [Permission.VIEW_USERS]: "View user profiles",
  [Permission.MANAGE_USERS]: "Create and manage users",
  [Permission.VIEW_GROUP]: "View group information",
  [Permission.MANAGE_GROUP]: "Create and manage groups",
  [Permission.VIEW_MEMBERS]: "View member profiles",
  [Permission.MANAGE_MEMBERS]: "Create and manage members",
  [Permission.VIEW_ORGANIZATION]: "View organization settings",
  [Permission.MANAGE_ORGANIZATION]: "Manage organization settings",
  [Permission.VIEW_SEASONS]: "View seasons and programs",
  [Permission.MANAGE_SEASONS]: "Create and manage seasons",
  [Permission.VIEW_ATTENDANCE]: "View attendance records",
  [Permission.MANAGE_ATTENDANCE]: "Manage attendance records",
  [Permission.VIEW_TRAINING]: "View training schedules",
  [Permission.MANAGE_TRAINING]: "Create and manage trainings",
  [Permission.VIEW_DASHBOARD]: "Access dashboard",
  [Permission.VIEW_SETTINGS_USERS]: "View users in organization settings",
  [Permission.MANAGE_SETTINGS_USERS]: "Manage users in organization settings",
  [Permission.VIEW_SETTINGS_ROLES]: "View roles in organization settings",
  [Permission.MANAGE_SETTINGS_ROLES]: "Manage roles in organization settings",
  [Permission.VIEW_SETTINGS_ORGANIZATION]: "View organization settings",
  [Permission.MANAGE_SETTINGS_ORGANIZATION]: "Manage organization settings",
  [Permission.VIEW_SCHEDULE]: "View schedule and events",
  [Permission.MANAGE_SCHEDULE]: "Manage schedule and events",
};

type PermissionCheck = {
  permissions?: string[] | null;
  requiredPermissions?: Permission[];
};

// Check if user has required permissions
export const checkPermissions = ({
  permissions,
  requiredPermissions = [],
}: PermissionCheck): boolean => {
  if (!permissions?.length) return false;

  // If no specific permissions are required, return true
  if (!requiredPermissions.length) return true;

  // Check if user has all required permissions
  return requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );
};

// Common permission checks grouped by feature
export const RolePermissions = {
  Users: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_USERS],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_USERS],
      }),
  },
  Groups: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_GROUP],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_GROUP],
      }),
  },
  Members: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_MEMBERS],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_MEMBERS],
      }),
  },
  Organization: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_ORGANIZATION],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_ORGANIZATION],
      }),
  },
  Seasons: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_SEASONS],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_SEASONS],
      }),
  },
  Attendance: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_ATTENDANCE],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_ATTENDANCE],
      }),
  },
  Training: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_TRAINING],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_TRAINING],
      }),
  },
  Settings: {
    Users: {
      manage: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.MANAGE_SETTINGS_USERS],
        }),
      view: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.VIEW_SETTINGS_USERS],
        }),
    },
    Roles: {
      manage: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.MANAGE_SETTINGS_ROLES],
        }),
      view: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.VIEW_SETTINGS_ROLES],
        }),
    },
    Organization: {
      manage: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.MANAGE_SETTINGS_ORGANIZATION],
        }),
      view: (permissions?: string[] | null) =>
        checkPermissions({
          permissions,
          requiredPermissions: [Permission.VIEW_SETTINGS_ORGANIZATION],
        }),
    },
  },
  Schedule: {
    manage: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.MANAGE_SCHEDULE],
      }),
    view: (permissions?: string[] | null) =>
      checkPermissions({
        permissions,
        requiredPermissions: [Permission.VIEW_SCHEDULE],
      }),
  },
};

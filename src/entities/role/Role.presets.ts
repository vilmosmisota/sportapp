import { TenantType } from "../tenant/Tenant.schema";
import { Permission } from "./Role.permissions";

export interface RolePreset {
  name: string;
  tenantType: TenantType;
  permissions: Permission[];
  description: string;
  isInstructor?: boolean;
}

export const rolePresets: RolePreset[] = [
  {
    name: "Manager",
    tenantType: TenantType.ORGANIZATION,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_USERS,
      Permission.MANAGE_USERS,
      Permission.VIEW_GROUP,
      Permission.MANAGE_GROUP,
      Permission.VIEW_MEMBERS,
      Permission.MANAGE_MEMBERS,
      Permission.VIEW_ORGANIZATION,
      Permission.MANAGE_ORGANIZATION,
      Permission.VIEW_SEASONS,
      Permission.MANAGE_SEASONS,
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
      Permission.VIEW_SETTINGS_USERS,
      Permission.MANAGE_SETTINGS_USERS,
      Permission.VIEW_SETTINGS_ROLES,
      Permission.MANAGE_SETTINGS_ROLES,
      Permission.VIEW_SETTINGS_ORGANIZATION,
      Permission.MANAGE_SETTINGS_ORGANIZATION,
    ],
    description: "Full access to all features and management capabilities",
    isInstructor: false,
  },
  {
    name: "Coach",
    tenantType: TenantType.ORGANIZATION,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_GROUP,
      Permission.MANAGE_GROUP,
      Permission.VIEW_MEMBERS,
      Permission.MANAGE_MEMBERS,
      Permission.VIEW_SEASONS,
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
    ],
    description: "Access to manage groups, members, trainings, and attendance",
    isInstructor: true,
  },
  {
    name: "Helper",
    tenantType: TenantType.ORGANIZATION,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_GROUP,
      Permission.VIEW_MEMBERS,
      Permission.VIEW_SEASONS,
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
    ],
    description:
      "View access to group information with attendance management capabilities",
    isInstructor: false,
  },
];

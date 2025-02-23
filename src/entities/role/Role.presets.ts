import { TenantType } from "../tenant/Tenant.schema";
import { Permission, RoleDomain } from "./Role.permissions";

export interface RolePreset {
  name: string;
  domain: RoleDomain;
  tenantType: TenantType;
  permissions: Permission[];
  description: string;
}

export const rolePresets: RolePreset[] = [
  {
    name: "Manager",
    domain: RoleDomain.MANAGEMENT,
    tenantType: TenantType.ORGANIZATION,
    permissions: [
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
    description: "Full access to all features and management capabilities",
  },
  {
    name: "Coach",
    domain: RoleDomain.MANAGEMENT,
    tenantType: TenantType.ORGANIZATION,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_TEAM,
      Permission.MANAGE_TEAM,
      Permission.VIEW_PLAYERS,
      Permission.MANAGE_PLAYERS,
      Permission.VIEW_SEASONS,
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
      Permission.VIEW_TRAINING,
      Permission.MANAGE_TRAINING,
    ],
    description: "Access to manage teams, players, trainings, and attendance",
  },
  {
    name: "Helper",
    domain: RoleDomain.MANAGEMENT,
    tenantType: TenantType.ORGANIZATION,
    permissions: [
      Permission.VIEW_DASHBOARD,
      Permission.VIEW_TEAM,
      Permission.VIEW_PLAYERS,
      Permission.VIEW_SEASONS,
      Permission.VIEW_ATTENDANCE,
      Permission.MANAGE_ATTENDANCE,
      Permission.VIEW_TRAINING,
    ],
    description:
      "View access to team information with attendance management capabilities",
  },
];

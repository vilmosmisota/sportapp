import { Domain, TenantType } from "./Role.schema";
import { Permission } from "./Role.permissions";

export interface RolePreset {
  name: string;
  domain: Domain;
  tenantType: TenantType;
  permissions: Permission[];
  description: string;
}

export const rolePresets: RolePreset[] = [
  {
    name: "Manager",
    domain: Domain.MANAGEMENT,
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
    domain: Domain.MANAGEMENT,
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
    name: "Parent",
    domain: Domain.FAMILY,
    tenantType: TenantType.ORGANIZATION,
    permissions: [], // No permissions needed - access is controlled by domain
    description: "Access to family dashboard and all related features",
  },
  {
    name: "Helper",
    domain: Domain.MANAGEMENT, // Changed to MANAGEMENT since they need specific permissions
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

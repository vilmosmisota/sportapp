"use client";

import { Permission } from "@/entities/role/Role.permissions";
import Dashboard from "@/app/[domain]/(components)/Dashboard";
import { useParams } from "next/navigation";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";

const getNavItems = (
  teamManagementConfigComplete: boolean,
  trainingLocationsConfigured: boolean,
  gameLocationsConfigured: boolean
) => [
  {
    section: "",
    items: [
      {
        name: "Overview",
        href: "/o/dashboard",
        iconName: "LayoutDashboard",
        description: "Overview of your organization",
        permissions: [Permission.VIEW_DASHBOARD],
      },
    ],
  },
  {
    section: "Organization",
    items: [
      {
        name: "Settings",
        href: "/o/dashboard/organization",
        iconName: "Building2",
        description: "Manage organization settings",
        permissions: [
          Permission.VIEW_ORGANIZATION,
          Permission.MANAGE_ORGANIZATION,
        ],
      },
      {
        name: "Roles",
        href: "/o/dashboard/roles",
        iconName: "ShieldCheck",
        description: "Manage roles and permissions",
        permissions: [Permission.MANAGE_USERS],
        allowSystemRole: true,
      },
      {
        name: "Users",
        href: "/o/dashboard/users",
        iconName: "Users2",
        description: "Manage staff and permissions",
        permissions: [Permission.VIEW_USERS, Permission.MANAGE_USERS],
      },
    ],
  },
  {
    section: "Team Management",
    items: [
      {
        name: "Seasons",
        href: "/o/dashboard/seasons",
        iconName: "GraduationCap",
        description: "Manage seasons and programs",
        permissions: [Permission.VIEW_SEASONS, Permission.MANAGE_SEASONS],
        disabled: !teamManagementConfigComplete,
        disabledReason:
          "Configure age groups, skill levels, and player positions in Organization settings first",
      },
      {
        name: "Players",
        href: "/o/dashboard/players",
        iconName: "UserRound",
        description: "Manage player profiles",
        permissions: [Permission.VIEW_PLAYERS, Permission.MANAGE_PLAYERS],
        disabled: !teamManagementConfigComplete,
        disabledReason:
          "Configure age groups, skill levels, and player positions in Organization settings first",
      },
      {
        name: "Teams",
        href: "/o/dashboard/teams",
        iconName: "ShieldCheck",
        description: "Manage teams and rosters",
        permissions: [Permission.VIEW_TEAM, Permission.MANAGE_TEAM],
        disabled: !teamManagementConfigComplete,
        disabledReason:
          "Configure age groups, skill levels, and player positions in Organization settings first",
      },
    ],
  },
  {
    section: "Training & Development",
    items: [
      {
        name: "Trainings",
        href: "/o/dashboard/trainings",
        iconName: "Dumbbell",
        description: "Schedule and plan trainings",
        permissions: [Permission.VIEW_TRAINING, Permission.MANAGE_TRAINING],
        disabled: !trainingLocationsConfigured,
        disabledReason:
          "Add at least one training location in Organization settings first",
      },
      {
        name: "Attendance",
        href: "/o/dashboard/attendance",
        iconName: "ClipboardCheck",
        description: "Track attendance",
        permissions: [Permission.VIEW_ATTENDANCE, Permission.MANAGE_ATTENDANCE],
        disabled: !trainingLocationsConfigured,
        disabledReason:
          "Add at least one training location in Organization settings first",
      },
      {
        name: "Statistics",
        href: "/o/dashboard/attendance/statistics",
        iconName: "BarChart3",
        description: "View attendance reports",
        permissions: [Permission.VIEW_ATTENDANCE],
        disabled: !trainingLocationsConfigured,
        disabledReason:
          "Add at least one training location in Organization settings first",
      },
    ],
  },
  {
    section: "Competition",
    items: [
      {
        name: "Opponents",
        href: "/o/dashboard/opponents",
        iconName: "Swords",
        description: "Manage competing teams",
        permissions: [Permission.VIEW_TEAM],
        disabled: !gameLocationsConfigured,
        disabledReason:
          "Add at least one game location in Organization settings first",
      },
      // Future Game section items would go here
      // {
      //   name: "Games",
      //   href: "/o/dashboard/games",
      //   iconName: "Trophy",
      //   description: "Manage games and matches",
      //   permissions: [Permission.VIEW_GAMES, Permission.MANAGE_GAMES],
      //   disabled: !gameLocationsConfigured,
      //   disabledReason: "Add at least one game location in Organization settings first",
      // },
      // {
      //   name: "Game Stats",
      //   href: "/o/dashboard/games/stats",
      //   iconName: "LineChart",
      //   description: "View game statistics",
      //   permissions: [Permission.VIEW_GAMES],
      //   disabled: !gameLocationsConfigured,
      //   disabledReason: "Add at least one game location in Organization settings first",
      // },
    ],
  },
];

export default function OrgDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const domain = params.domain as string;
  const { data: tenant } = useTenantByDomain(domain);

  // Check if team management configuration is complete
  const teamManagementConfigComplete = Boolean(
    tenant?.groupTypes &&
      tenant.groupTypes.ageGroups?.length > 0 &&
      tenant.groupTypes.skillLevels?.length > 0 &&
      tenant.groupTypes.positions?.length > 0
  );

  // Check if training locations are configured
  const trainingLocationsConfigured = Boolean(
    tenant?.trainingLocations && tenant.trainingLocations.length > 0
  );

  // Check if game locations are configured
  const gameLocationsConfigured = Boolean(
    tenant?.gameLocations &&
      tenant.gameLocations.length > 0 &&
      tenant.competitionTypes &&
      tenant.competitionTypes.length > 0
  );

  const navItems = getNavItems(
    teamManagementConfigComplete,
    trainingLocationsConfigured,
    gameLocationsConfigured
  );

  return <Dashboard items={navItems}>{children}</Dashboard>;
}

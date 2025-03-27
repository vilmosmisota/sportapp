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
        name: "Home",
        href: "/o/dashboard",
        iconName: "Home",
        description: "Organization overview and quick insights",
        permissions: [Permission.VIEW_DASHBOARD],
      },
      {
        name: "Schedule",
        href: "/o/dashboard/calendar",
        iconName: "CalendarDays",
        description: "Manage all events and schedules",
        permissions: [Permission.VIEW_DASHBOARD],
      },
      {
        name: "News",
        href: "/o/dashboard/news",
        iconName: "Newspaper",
        description: "View news and announcements",
        permissions: [],
        disabled: true,
        disabledReason: "Coming soon",
      },
    ],
  },
  {
    section: "Rostering",
    items: [
      {
        name: "Season Setup",
        href: "/o/dashboard/seasons",
        iconName: "SunSnow",
        description: "Manage seasons and programs",
        permissions: [Permission.VIEW_SEASONS, Permission.MANAGE_SEASONS],
        disabled: !teamManagementConfigComplete,
        disabledReason:
          "Configure age groups, skill levels, and player positions in Organization settings first",
      },
      {
        name: "Player Roster",
        href: "/o/dashboard/players",
        iconName: "Users",
        description: "Manage player profiles",
        permissions: [Permission.VIEW_PLAYERS, Permission.MANAGE_PLAYERS],
        disabled: !teamManagementConfigComplete,
        disabledReason:
          "Configure age groups, skill levels, and player positions in Organization settings first",
      },
      {
        name: "Team Management",
        href: "/o/dashboard/teams",
        iconName: "Users2",
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
        name: "Live Tracker",
        href: "/o/dashboard/attendance",
        iconName: "ClipboardList",
        description: "Monitor live attendance and session participation",
        permissions: [Permission.VIEW_ATTENDANCE, Permission.MANAGE_ATTENDANCE],
      },
      {
        name: "Performance Analytics",
        href: "/o/dashboard/analytics/training",
        iconName: "Activity",
        description:
          "View attendance trends, participation rates, and training effectiveness",
        permissions: [Permission.VIEW_TRAINING, Permission.MANAGE_TRAINING],
        disabled: !trainingLocationsConfigured,
        disabledReason:
          "Add at least one training location in Organization settings first",
      },
    ],
  },
  {
    section: "Games & Competition",
    items: [
      {
        name: "Opponent Directory",
        href: "/o/dashboard/opponents",
        iconName: "Swords",
        description: "Manage competing teams",
        permissions: [Permission.VIEW_TEAM],
        disabled: !gameLocationsConfigured,
        disabledReason:
          "Add at least one game location in Organization settings first",
      },
      {
        name: "Game Recorder",
        href: "/o/dashboard/game-tracker",
        iconName: "ClipboardPen",
        description: "Record and analyze game performances",
        permissions: [],
        disabled: true,
        disabledReason: "Coming soon",
      },
      {
        name: "Game Analytics",
        href: "/o/dashboard/analytics/game",
        iconName: "Signal",
        description:
          "Analyze game results, player performance, and team metrics",
        permissions: [],
        disabled: true,
        disabledReason: "Coming soon",
      },
    ],
  },
  {
    section: "Archives & History",
    items: [
      {
        name: "Season Archives",
        href: "/o/dashboard/archives/seasons",
        iconName: "Archive",
        description: "Access historical season data and archives",
        permissions: [Permission.VIEW_SEASONS],
        disabled: true,
        disabledReason: "Coming soon",
      },
      {
        name: "Performance History",
        href: "/o/dashboard/archives/performance",
        iconName: "LibraryBig",
        description: "Historical training and game performance data",
        permissions: [Permission.VIEW_TRAINING, Permission.VIEW_ATTENDANCE],
        disabled: true,
        disabledReason: "Coming in Q3 2024",
      },
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

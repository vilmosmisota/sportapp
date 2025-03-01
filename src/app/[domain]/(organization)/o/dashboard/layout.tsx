"use client";

import { Permission } from "@/entities/role/Role.permissions";
import Dashboard from "@/app/[domain]/(components)/Dashboard";

const navItems = [
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
      },
      {
        name: "Players",
        href: "/o/dashboard/players",
        iconName: "UserRound",
        description: "Manage player profiles",
        permissions: [Permission.VIEW_PLAYERS, Permission.MANAGE_PLAYERS],
      },
      {
        name: "Teams",
        href: "/o/dashboard/teams",
        iconName: "ShieldCheck",
        description: "Manage teams and rosters",
        permissions: [Permission.VIEW_TEAM, Permission.MANAGE_TEAM],
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
      },
      {
        name: "Attendance",
        href: "/o/dashboard/attendance",
        iconName: "ClipboardCheck",
        description: "Track attendance",
        permissions: [Permission.VIEW_ATTENDANCE, Permission.MANAGE_ATTENDANCE],
      },
      {
        name: "Statistics",
        href: "/o/dashboard/attendance/statistics",
        iconName: "BarChart3",
        description: "View attendance reports",
        permissions: [Permission.VIEW_ATTENDANCE],
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
      },
      // Future Game section items would go here
      // {
      //   name: "Games",
      //   href: "/o/dashboard/games",
      //   iconName: "Trophy",
      //   description: "Manage games and matches",
      //   permissions: [Permission.VIEW_GAMES, Permission.MANAGE_GAMES],
      // },
      // {
      //   name: "Game Stats",
      //   href: "/o/dashboard/games/stats",
      //   iconName: "LineChart",
      //   description: "View game statistics",
      //   permissions: [Permission.VIEW_GAMES],
      // },
    ],
  },
];

export default function OrgDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard items={navItems}>{children}</Dashboard>;
}

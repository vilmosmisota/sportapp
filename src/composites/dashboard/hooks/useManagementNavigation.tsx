import {
  getTenantPerformerName,
  getTenantPerformerSlug,
} from "@/entities/member/Member.utils";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { NavItem } from "../components/DashboardNavItem";

export interface NavSection {
  section: string;
  items: NavItem[];
}

export function useManagementNavigation(tenant?: Tenant) {
  const navSections: NavSection[] = [
    {
      section: "Default",
      items: [
        {
          id: 1,
          name: "Home",
          href: "/app/management",
          iconName: "Home",
          description: "Organization overview and quick insights",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
        {
          id: 2,
          name: "Schedule",
          href: "/app/management/schedule",
          iconName: "CalendarDays",
          description: "Manage all events and schedules",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
        // {
        //   id: 3,
        //   name: "News",
        //   href: /app/management/news",
        //   iconName: "Newspaper",
        //   description: "View news and announcements",
        //   permissions: [],
        //   disabled: true,
        //   disabledReason: "Coming soon",
        //   pinnable: false,
        // },
      ],
    },
    {
      section: "Management",
      items: [
        {
          id: 4,
          name: "Seasons",
          href: "/app/management/seasons",
          iconName: "SunSnow",
          description: "Manage seasons and programs",
          permissions: [Permission.VIEW_SEASONS, Permission.MANAGE_SEASONS],
          disabled: false,
          disabledReason:
            "Configure age groups, skill levels, and player positions in Organization settings first",
          pinnable: true,
        },
        ...(tenant
          ? [
              {
                id: 5,
                name: getTenantPerformerName(tenant),
                href: `/app/management/members/${getTenantPerformerSlug(
                  tenant
                )}`,
                iconName: "Users",
                description: `Manage your organization's ${getTenantPerformerName(
                  tenant
                ).toLowerCase()} and their teams`,
                permissions: [
                  Permission.VIEW_MEMBERS,
                  Permission.MANAGE_MEMBERS,
                ],
                pinnable: true,
              },
            ]
          : []),
      ],
    },
    {
      section: "Training & Development",
      items: [
        {
          id: 7,
          name: "Attendance Manager",
          href: "/app/management/training-attendance",
          iconName: "ClipboardList",
          description: "Monitor live attendance and session participation",
          permissions: [
            Permission.VIEW_ATTENDANCE,
            Permission.MANAGE_ATTENDANCE,
          ],
          pinnable: true,
        },
        {
          id: 8,
          name: "Attendance Analytics",
          href: "/app/management/training-analytics",
          iconName: "Activity",
          description:
            "View attendance trends, participation rates, and training effectiveness",
          permissions: [Permission.VIEW_TRAINING, Permission.MANAGE_TRAINING],
          disabled: false,
          disabledReason:
            "Add at least one training location in Organization settings first",
          pinnable: true,
        },
      ],
    },
    // {
    //   section: "Games & Competition",
    //   items: [
    //     {
    //       id: 9,
    //       name: "Opponent Directory",
    //       href: /app/management/opponents",
    //       iconName: "Swords",
    //       description: "Manage competing teams",
    //       permissions: [Permission.VIEW_GROUP],
    //       disabled: !gameLocationsConfigured,
    //       disabledReason:
    //         "Add at least one game location in Organization settings first",
    //       pinnable: true,
    //     },
    //     {
    //       id: 10,
    //       name: "Game Recorder",
    //       href: /app/management/game-tracker",
    //       iconName: "ClipboardPen",
    //       description: "Record and analyze game performances",
    //       permissions: [],
    //       disabled: true,
    //       disabledReason: "Coming soon",
    //       pinnable: false,
    //     },
    //     {
    //       id: 11,
    //       name: "Game Analytics",
    //       href: /app/management/analytics/game",
    //       iconName: "Signal",
    //       description:
    //         "Analyze game results, player performance, and team metrics",
    //       permissions: [],
    //       disabled: true,
    //       disabledReason: "Coming soon",
    //       pinnable: false,
    //     },
    //   ],
    // },
    // {
    //   section: "Archives & History",
    //   items: [
    //     {
    //       id: 12,
    //       name: "Season Archives",
    //       href: /app/management/archives/seasons",
    //       iconName: "Archive",
    //       description: "Access historical season data and archives",
    //       permissions: [Permission.VIEW_SEASONS],
    //       disabled: true,
    //       disabledReason: "Coming soon",
    //       pinnable: false,
    //     },
    //     {
    //       id: 13,
    //       name: "Performance History",
    //       href: /app/management/archives/performance",
    //       iconName: "LibraryBig",
    //       description: "Historical training and game performance data",
    //       permissions: [Permission.VIEW_TRAINING, Permission.VIEW_ATTENDANCE],
    //       disabled: true,
    //       disabledReason: "Coming in Q3 2024",
    //       pinnable: false,
    //     },
    //   ],
    // },
  ];

  return { navSections };
}

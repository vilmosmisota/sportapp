import { Permission } from "../../../../../entities/role/Role.permissions";
import { NavSection } from "../constants";

export function useNavigation(
  teamManagementConfigComplete: boolean,
  trainingLocationsConfigured: boolean,
  gameLocationsConfigured: boolean
) {
  const navItems: NavSection[] = [
    {
      section: "Default",
      items: [
        {
          id: 1,
          name: "Home",
          href: "/o/dashboard",
          iconName: "Home",
          description: "Organization overview and quick insights",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
        {
          id: 2,
          name: "Schedule",
          href: "/o/dashboard/schedule",
          iconName: "CalendarDays",
          description: "Manage all events and schedules",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
        // {
        //   id: 3,
        //   name: "News",
        //   href: "/o/dashboard/news",
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
          href: "/o/dashboard/seasons",
          iconName: "SunSnow",
          description: "Manage seasons and programs",
          permissions: [Permission.VIEW_SEASONS, Permission.MANAGE_SEASONS],
          disabled: !teamManagementConfigComplete,
          disabledReason:
            "Configure age groups, skill levels, and player positions in Organization settings first",
          pinnable: true,
        },
        {
          id: 5,
          name: "Players",
          href: "/o/dashboard/players",
          iconName: "Users",
          description: "Manage player profiles",
          permissions: [Permission.VIEW_PLAYERS, Permission.MANAGE_PLAYERS],
          disabled: !teamManagementConfigComplete,
          disabledReason:
            "Configure age groups, skill levels, and player positions in Organization settings first",
          pinnable: true,
        },
        {
          id: 6,
          name: "Teams",
          href: "/o/dashboard/teams",
          iconName: "Users2",
          description: "Manage teams and rosters",
          permissions: [Permission.VIEW_TEAM, Permission.MANAGE_TEAM],
          disabled: !teamManagementConfigComplete,
          disabledReason:
            "Configure age groups, skill levels, and player positions in Organization settings first",
          pinnable: true,
        },
      ],
    },
    {
      section: "Training & Development",
      items: [
        {
          id: 7,
          name: "Attendance Manager",
          href: "/o/dashboard/training-attendance",
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
          href: "/o/dashboard/training-analytics",
          iconName: "Activity",
          description:
            "View attendance trends, participation rates, and training effectiveness",
          permissions: [Permission.VIEW_TRAINING, Permission.MANAGE_TRAINING],
          disabled: !trainingLocationsConfigured,
          disabledReason:
            "Add at least one training location in Organization settings first",
          pinnable: true,
        },
      ],
    },
    {
      section: "Games & Competition",
      items: [
        {
          id: 9,
          name: "Opponent Directory",
          href: "/o/dashboard/opponents",
          iconName: "Swords",
          description: "Manage competing teams",
          permissions: [Permission.VIEW_TEAM],
          disabled: !gameLocationsConfigured,
          disabledReason:
            "Add at least one game location in Organization settings first",
          pinnable: true,
        },
        {
          id: 10,
          name: "Game Recorder",
          href: "/o/dashboard/game-tracker",
          iconName: "ClipboardPen",
          description: "Record and analyze game performances",
          permissions: [],
          disabled: true,
          disabledReason: "Coming soon",
          pinnable: false,
        },
        {
          id: 11,
          name: "Game Analytics",
          href: "/o/dashboard/analytics/game",
          iconName: "Signal",
          description:
            "Analyze game results, player performance, and team metrics",
          permissions: [],
          disabled: true,
          disabledReason: "Coming soon",
          pinnable: false,
        },
      ],
    },
    {
      section: "Archives & History",
      items: [
        {
          id: 12,
          name: "Season Archives",
          href: "/o/dashboard/archives/seasons",
          iconName: "Archive",
          description: "Access historical season data and archives",
          permissions: [Permission.VIEW_SEASONS],
          disabled: true,
          disabledReason: "Coming soon",
          pinnable: false,
        },
        {
          id: 13,
          name: "Performance History",
          href: "/o/dashboard/archives/performance",
          iconName: "LibraryBig",
          description: "Historical training and game performance data",
          permissions: [Permission.VIEW_TRAINING, Permission.VIEW_ATTENDANCE],
          disabled: true,
          disabledReason: "Coming in Q3 2024",
          pinnable: false,
        },
      ],
    },
  ];

  return { navItems };
}

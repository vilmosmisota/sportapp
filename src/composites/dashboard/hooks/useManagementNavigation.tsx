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
          href: "/management",
          iconName: "Home",
          description: "Organization overview and quick insights",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
        {
          id: 2,
          name: "Schedule",
          href: "/management/schedule",
          iconName: "CalendarDays",
          description: "Manage all events and schedules",
          permissions: [Permission.VIEW_DASHBOARD],
          pinnable: true,
        },
      ],
    },
    {
      section: "Members",
      items: [
        ...(tenant
          ? [
              {
                id: 4,
                name: getTenantPerformerName(tenant),
                href: `/management/members/${getTenantPerformerSlug(tenant)}`,
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
        {
          id: 3,
          name: "Guardians",
          href: "/management/members/guardians",
          iconName: "Shield",
          description: "Manage guardians and parent contacts",
          permissions: [Permission.VIEW_MEMBERS, Permission.MANAGE_MEMBERS],
          pinnable: true,
        },
        {
          id: 10,
          name: "Staff",
          href: "/management/members/staff",
          iconName: "UserRound",
          description:
            "Manage coaches, staff, managers, and administrative personnel",
          permissions: [Permission.VIEW_MEMBERS, Permission.MANAGE_MEMBERS],
          pinnable: true,
        },
      ],
    },
    {
      section: "Management",
      items: [
        {
          id: 12,
          name: "Seasons",
          href: "/management/seasons",
          iconName: "SunSnow",
          description: "Manage seasons and programs",
          permissions: [Permission.VIEW_SEASONS, Permission.MANAGE_SEASONS],
          disabled: false,
          disabledReason:
            "Configure age groups, skill levels, and player positions in Organization settings first",
          pinnable: true,
        },
        {
          id: 13,
          name: "Groups",
          href: "/management/groups",
          iconName: "Users2",
          description: "Organize and manage team groups",
          permissions: [Permission.VIEW_GROUP, Permission.MANAGE_GROUP],
          pinnable: true,
        },
      ],
    },
    {
      section: "Events",
      items: [
        {
          id: 14,
          name: "Sessions",
          href: "/management/sessions",
          iconName: "DumbbellIcon",
          description: "Schedule and manage training sessions",
          permissions: [Permission.VIEW_EVENTS, Permission.MANAGE_EVENTS],
          pinnable: true,
        },
      ],
    },
    {
      section: "Attendance",
      items: [
        {
          id: 15,
          name: "Attendance Manager",
          href: "/management/attendance",
          iconName: "ClipboardList",
          description: "Monitor live attendance and session participation",
          permissions: [
            Permission.VIEW_ATTENDANCE,
            Permission.MANAGE_ATTENDANCE,
          ],
          pinnable: true,
        },
        {
          id: 16,
          name: "Attendance Reports",
          href: "/management/attendance/reports",
          iconName: "BarChart3",
          description:
            "View attendance trends, participation rates, and training effectiveness",
          permissions: [
            Permission.VIEW_ATTENDANCE,
            Permission.MANAGE_ATTENDANCE,
          ],
          disabled: false,
          disabledReason:
            "Add at least one training location in Organization settings first",
          pinnable: true,
        },
      ],
    },
  ];

  return { navSections };
}

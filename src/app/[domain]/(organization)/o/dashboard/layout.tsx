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
      },
      {
        name: "Seasons",
        href: "/o/dashboard/seasons",
        iconName: "GraduationCap",
        description: "Manage seasons and programs",
      },
      {
        name: "Users",
        href: "/o/dashboard/users",
        iconName: "Users2",
        description: "Manage staff and permissions",
      },
    ],
  },
  {
    section: "Team Management",
    items: [
      {
        name: "Players",
        href: "/o/dashboard/players",
        iconName: "UserRound",
        description: "Manage player profiles",
      },
      {
        name: "Teams",
        href: "/o/dashboard/teams",
        iconName: "ShieldCheck",
        description: "Manage teams and rosters",
      },
      {
        name: "Opponents",
        href: "/o/dashboard/opponents",
        iconName: "Swords",
        description: "Manage competing teams",
      },
      {
        name: "Trainings",
        href: "/o/dashboard/trainings",
        iconName: "Dumbbell",
        description: "Schedule and plan trainings",
      },
    ],
  },
  {
    section: "Attendance",
    items: [
      {
        name: "Check-in",
        href: "/o/dashboard/attendance",
        iconName: "ClipboardCheck",
        description: "Track attendance",
      },
      {
        name: "Statistics",
        href: "/o/dashboard/attendance/statistics",
        iconName: "BarChart3",
        description: "View attendance reports",
      },
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

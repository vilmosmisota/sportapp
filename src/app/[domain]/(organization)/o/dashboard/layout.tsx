import Dashboard from "@/app/[domain]/(components)/Dashboard";

const navItems = [
  {
    name: "Overview",
    href: "/o/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    name: "Organisation",
    href: "/o/dashboard/organization",
    iconName: "Building2",
  },
  {
    name: "Teams",
    href: "/o/dashboard/teams",
    iconName: "Users2",
  },
  {
    name: "Players",
    href: "/o/dashboard/players",
    iconName: "UserRound",
  },
  {
    name: "Trainings",
    href: "/o/dashboard/trainings",
    iconName: "Dumbbell",
  },
  {
    name: "Statistics",
    href: "/o/dashboard/statistics",
    iconName: "BarChart3",
  },
];

export default function OrgDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard items={navItems}>{children}</Dashboard>;
}

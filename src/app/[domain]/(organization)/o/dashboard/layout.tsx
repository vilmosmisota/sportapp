import Dashboard from "@/app/[domain]/(components)/Dashboard";
import {
  Building2,
  Users2,
  UserRound,
  Dumbbell,
  BarChart3,
  GraduationCap,
  Users,
  LayoutDashboard,
} from "lucide-react";

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
    name: "Users",
    href: "/o/dashboard/users",
    iconName: "UsersRound",
  },
  {
    name: "Players",
    href: "/o/dashboard/players",
    iconName: "UserRound",
  },
  {
    name: "Teams",
    href: "/o/dashboard/teams",
    iconName: "ShieldCheck",
  },

  {
    name: "Trainings",
    href: "/o/dashboard/trainings",
    iconName: "Dumbbell",
  },
  {
    name: "Attendance",
    href: "/o/dashboard/attendance",
    iconName: "ClipboardCheck",
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

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
  Settings,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    section: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/o/dashboard",
        iconName: "LayoutDashboard",
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
      },
      {
        name: "Users",
        href: "/o/dashboard/users",
        iconName: "Users2",
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
    ],
  },
  {
    section: "Attendance",
    items: [
      {
        name: "Check-in",
        href: "/o/dashboard/attendance",
        iconName: "ClipboardCheck",
      },
      {
        name: "Statistics",
        href: "/o/dashboard/attendance/statistics",
        iconName: "BarChart3",
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

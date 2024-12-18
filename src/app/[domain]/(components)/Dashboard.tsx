"use client";

import {
  Building2,
  Users2,
  UserRound,
  Dumbbell,
  BarChart3,
  GraduationCap,
  Users,
  LayoutDashboard,
  LucideIcon,
  Building,
  Store,
  Medal,
  Shield,
} from "lucide-react";
import DashboardNav from "./DashboardNav";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Users,
  Users2,
  UserRound,
  GraduationCap,
  Dumbbell,
  BarChart3,
  Building,
  Store,
  Medal,
  Shield,
};

type NavItem = {
  name: string;
  href: string;
  iconName: keyof typeof iconMap;
};

type DashboardProps = {
  children: React.ReactNode;
  items: NavItem[];
};

export default function Dashboard({ items, children }: DashboardProps) {
  return (
    <div className="grid min-h-[calc(100vh-64px)] w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1">
            <DashboardNav items={items} icons={iconMap} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

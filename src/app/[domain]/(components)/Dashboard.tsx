"use client";

import {
  Building2,
  UsersRound,
  UserRound,
  Dumbbell,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  Building,
  Store,
  Medal,
  Shield,
  ShieldCheck,
} from "lucide-react";
import DashboardNav from "./DashboardNav";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  UsersRound,
  UserRound,
  GraduationCap,
  Dumbbell,
  BarChart3,
  Building,
  Store,
  Medal,
  Shield,
  ShieldCheck,
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
    <div className="grid min-h-[calc(100vh-48px)] w-full md:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block overflow-y-auto">
        <div className="flex h-full flex-col py-2">
          <div className="px-2 py-2">
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Dashboard
            </h2>
          </div>
          <div className="flex-1 px-2">
            <DashboardNav items={items} icons={iconMap} />
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
      </div>
    </div>
  );
}

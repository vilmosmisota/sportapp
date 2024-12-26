"use client";

import { Button } from "@/components/ui/button";
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
  Menu,
} from "lucide-react";
import DashboardNav from "./DashboardNav";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useState } from "react";
import { DashboardIcon } from "@radix-ui/react-icons";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid w-full md:grid-cols-[240px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:h-[calc(100vh-3rem)]">
        <div className="sticky top-0 flex h-full flex-col py-2">
          <div className="px-2 py-2">
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Dashboard
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-2 ">
            <DashboardNav items={items} icons={iconMap} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed top-3 right-7 z-40 md:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              className="md:hidden h-6 w-6"
              variant={"ghost"}
              size={"icon"}
            >
              <DashboardIcon className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <div className="flex h-full flex-col py-6 px-4">
              <h2 className="px-4 text-lg font-semibold tracking-tight mb-4">
                Dashboard
              </h2>
              <div className="flex-1 overflow-y-auto">
                <DashboardNav
                  items={items}
                  icons={iconMap}
                  className="gap-4"
                  onItemClick={() => setIsOpen(false)}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="flex flex-col bg-background">
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

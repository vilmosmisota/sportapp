import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/libs/tailwind/utils";
import { MenuIcon } from "lucide-react";

import Link from "next/link";
import MobileMenu from "./MobileMenu";
import AuthMenu from "./AuthMenu";
import NavLink from "./NavLink";

import { TenantLogo } from "./TenantLogo";
import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import { getServerClient } from "@/libs/supabase/server";

export async function Menu({ domain }: { domain: string }) {
  const serverClient = getServerClient();
  const tenant = await getTenantByDomain(domain, serverClient);

  return (
    <div className="max-w-screen-2xl bg-muted/40 flex  items-center justify-between  space-x-1  h-12 px-5 border-b shadow-sm">
      <div className="flex">
        <TenantLogo logoUrl={tenant?.logo} />
        <nav
          className={cn("md:flex items-center space-x-4 lg:space-x-6 hidden")}
        >
          <NavLink
            href="/"
            className="text-sm font-medium  transition-colors hover:text-primary"
            activeClassName="text-muted-foreground"
            nonActiveClassName="text-bar-foreground"
          >
            Home
          </NavLink>
          <NavLink
            href="/standings"
            className="text-sm font-medium  transition-colors hover:text-primary"
            activeClassName="text-muted-foreground"
            nonActiveClassName="text-bar-foreground"
          >
            Standings
          </NavLink>
          <NavLink
            href="/clubs"
            className="text-sm font-medium  transition-colors hover:text-primary"
            activeClassName="text-muted-foreground"
            nonActiveClassName="text-bar-foreground"
          >
            Clubs
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center justify-center gap-2">
        <AuthMenu tenantId={tenant?.id.toString()} />
        <MobileMenu />
      </div>
    </div>
  );
}

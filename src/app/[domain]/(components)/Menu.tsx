import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/libs/tailwind/utils";
import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import { getServerClient } from "@/libs/supabase/server";
import { TenantLogo } from "../(league)/components/TenantLogo";
import NavLink from "./NavLink";
import MobileMenu from "./MobileMenu";
import AuthMenu from "./AuthMenu";
import { TenantType } from "@/entities/tenant/Tenant.schema";

const leagueNavItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Standings",
    href: "/standings",
  },
  {
    name: "Clubs",
    href: "/clubs",
  },
];

const organizationNavItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Teams",
    href: "/teams",
  },
  {
    name: "News",
    href: "/news",
  },
  {
    name: "Events",
    href: "/events",
  },
  {
    name: "Gallery",
    href: "/gallery",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export async function Menu({ domain }: { domain: string }) {
  const serverClient = getServerClient();
  const tenant = await getTenantByDomain(domain, serverClient);

  const navItems =
    tenant?.type === TenantType.LEAGUE ? leagueNavItems : organizationNavItems;

  return (
    <div className="max-w-screen-2xl bg-muted/40 flex items-center justify-between space-x-1 h-12 px-5 border-b shadow-sm">
      <div className="flex">
        <TenantLogo logoUrl={tenant?.logo} />
        <nav
          className={cn("md:flex items-center space-x-4 lg:space-x-6 hidden")}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
              activeClassName="text-muted-foreground"
              nonActiveClassName="text-bar-foreground"
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-center gap-2">
        <AuthMenu tenantId={tenant?.id.toString()} />
        <MobileMenu navItems={navItems} />
      </div>
    </div>
  );
}

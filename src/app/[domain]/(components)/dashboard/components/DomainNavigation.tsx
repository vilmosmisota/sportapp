import { CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { useCurrentUser } from "../../../../../entities/user/User.query";
import { UserDomain } from "../../../../../entities/user/User.schema";
import { cn } from "../../../../../lib/utils";

interface DomainNavigationProps {
  currentDomain: string;
  tenantId?: number;
  isLoading?: boolean;
}

const domainLabels: Record<UserDomain, string> = {
  [UserDomain.MANAGEMENT]: "Management",
  [UserDomain.PARENT]: "Parent",
  [UserDomain.PERFORMER]: "Performer",
  [UserDomain.SYSTEM]: "System",
};

const domainRoutes: Record<UserDomain, string> = {
  [UserDomain.MANAGEMENT]: "/o/dashboard",
  [UserDomain.PARENT]: "/f/dashboard",
  [UserDomain.PERFORMER]: "/p/dashboard",
  [UserDomain.SYSTEM]: "/o/dashboard", // System roles default to organization dashboard
};

function DomainNavSkeleton() {
  return (
    <div className="flex items-center justify-between w-full py-1.5 px-2 rounded-md">
      <div className="w-full flex items-center justify-center">
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-4 shrink-0 ml-2" />
    </div>
  );
}

export function DomainNavigation({
  currentDomain,
  tenantId,
  isLoading = false,
}: DomainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const pathname = usePathname();

  if (userLoading || isLoading || !tenantId) {
    return <DomainNavSkeleton />;
  }

  if (!user) return null;

  // Check if user has system role
  const hasSystemRole = user.userDomains?.includes(UserDomain.SYSTEM);

  // Get all available domains for the current tenant
  const currentTenantUser = user.tenantUsers?.find(
    (tenantUser) => tenantUser.tenantId === tenantId
  );

  // Get current route type
  const getCurrentDomainFromPath = (): UserDomain => {
    if (pathname.startsWith("/o/")) return UserDomain.MANAGEMENT;
    if (pathname.startsWith("/f/")) return UserDomain.PARENT;
    if (pathname.startsWith("/p/")) return UserDomain.PERFORMER;
    return UserDomain.MANAGEMENT;
  };

  const activeDomain = getCurrentDomainFromPath();

  // Get available domains from user's domains
  const availableDomains = user.userDomains.filter(
    (domain) => domain !== UserDomain.SYSTEM
  );

  // Determine which domains to show
  const domainOptions = hasSystemRole
    ? Object.values(UserDomain).filter((domain) => domain !== UserDomain.SYSTEM)
    : availableDomains;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between w-full hover:bg-accent/30 py-1.5 px-2 rounded-md transition-colors text-center">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">
              {domainLabels[activeDomain]}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {domainOptions.map((domain) => {
            const label = domainLabels[domain];
            const route = domainRoutes[domain];
            const isActive = domain === activeDomain;

            return (
              <DropdownMenuItem
                key={domain}
                asChild
                className={cn("gap-2", isActive && "bg-accent")}
              >
                <Link href={route} className="flex items-center">
                  <span className="truncate flex-1">{label}</span>
                  {isActive && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

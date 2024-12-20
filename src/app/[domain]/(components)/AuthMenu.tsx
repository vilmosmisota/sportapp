"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogOut } from "@/entities/user/User.actions.client";
import { useCurrentUser } from "@/entities/user/User.query";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { TenantType } from "@/entities/tenant/Tenant.schema";

export default function AuthMenu({
  tenantId,
  tenantType,
}: {
  tenantId: string | undefined;
  tenantType: TenantType;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const logOutMutation = useLogOut();

  const handleSignOut = async () => {
    try {
      await logOutMutation.mutateAsync();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const dashboardUrl =
    tenantType === TenantType.LEAGUE ? "/l/dashboard" : "/o/dashboard";

  if (isLoading) {
    return null;
  }

  return user ? (
    <div className="flex items-center gap-3">
      <Button size={"sm"} variant={"default"} asChild>
        <Link href={dashboardUrl}>Dashboard</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <UserCircle />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.entity?.adminRole || user.entity?.domainRole || "Member"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/notifications">Notifications</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/help">Help & Support</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleSignOut}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <Button size="sm" asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}

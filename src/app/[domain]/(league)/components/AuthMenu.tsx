"use client";

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
import { useEffect } from "react";

export default function AuthMenu({
  tenantId,
}: {
  tenantId: string | undefined;
}) {
  const { data: user, isLoading, error } = useCurrentUser();
  const logOutMutation = useLogOut();

  if (isLoading) return null;

  return user ? (
    <div className="flex items-center gap-3">
      <Button size={"sm"} variant={"default"} asChild>
        <Link href={"/o/dashboard"}>Dashboard</Link>
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
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button onClick={() => logOutMutation.mutate()}>Logout</Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <Link
      href="/login"
      className="text-sm font-medium transition-colors hover:text-primary"
    >
      Login
    </Link>
  );
}

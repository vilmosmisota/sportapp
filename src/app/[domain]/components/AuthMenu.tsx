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
import { useGetUser } from "@/entities/user/User.services.client";

import { UserCircle } from "lucide-react";
import Link from "next/link";

export default function AuthMenu() {
  const { data: user } = useGetUser();
  const logOutMutation = useLogOut();

  return user ? (
    <div className="flex items-center gap-3">
      <Button size={"sm"} variant={"default"} asChild>
        <Link href={"/dashboard"}>Dashboard</Link>
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
            <Button onClick={() => logOutMutation.mutate()}>Logout</Button>;
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

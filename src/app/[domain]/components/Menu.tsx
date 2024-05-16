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

export function Menu({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="max-w-screen-2xl bg-bar flex  items-center justify-between  space-x-1  h-12 px-5 shadow-sm">
      <div className="flex">
        <div className=" text-center mr-5">
          <Avatar>
            <AvatarImage src="/lwpl.png" />
            <AvatarFallback>LWPC</AvatarFallback>
          </Avatar>
        </div>
        <nav
          className={cn(
            "md:flex items-center space-x-4 lg:space-x-6 hidden",
            className
          )}
          {...props}
        >
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-bar-foreground transition-colors hover:text-primary"
          >
            Standing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-bar-foreground transition-colors hover:text-primary"
          >
            Teams
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-center gap-2">
        <AuthMenu />
        <MobileMenu />
      </div>
    </div>
  );
}

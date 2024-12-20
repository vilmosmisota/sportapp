"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/libs/tailwind/utils";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

type NavItem = {
  name: string;
  href: string;
};

export default function MobileMenu({ navItems }: { navItems: NavItem[] }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="md:hidden" variant={"outline"} size={"icon"}>
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[calc(100%-3rem)] bg-bar flex items-center justify-center">
        <nav
          className={cn(
            "flex flex-col justify-center gap-4 text-center items-center h-full"
          )}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/libs/tailwind/utils";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="md:hidden" variant={"outline"} size={"icon"}>
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[calc(100%-3rem)] bg-bar flex items-center justify-center">
        {/* <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader> */}

        <nav
          className={cn(
            "flex flex-col justify-center gap-4 text-center items-center  h-full"
          )}
        >
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/examples/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Standing
          </Link>
          <Link
            href="/examples/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Teams
          </Link>
          <Link
            href="/examples/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Players
          </Link>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

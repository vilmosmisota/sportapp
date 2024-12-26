"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/utils/hooks";

export function ResponsiveSheet({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description?: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full  overflow-y-auto">
          <div className="h-full flex flex-col">
            <SheetHeader className="flex-shrink-0 pb-4">
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-2">{children}</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="px-4 pt-4 pb-8 h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0 px-0">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto -mx-4 px-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

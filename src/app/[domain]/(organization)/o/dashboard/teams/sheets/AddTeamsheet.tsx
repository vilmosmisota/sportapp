"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import AddTeamForm from "../forms/AddTeamForm";

export default function AddTeamsheet({ tenantId }: { tenantId: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={() => {
        setSheetOpen(!sheetOpen);
      }}
    >
      <SheetTrigger asChild>
        <Button>Add team</Button>
      </SheetTrigger>
      <SheetContent className="overflow-auto pb-0">
        <div className="relative h-full">
          <SheetHeader className="mb-5">
            <SheetTitle>Add team</SheetTitle>
          </SheetHeader>

          <AddTeamForm tenantId={tenantId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

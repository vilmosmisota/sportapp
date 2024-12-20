"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { format } from "date-fns";
import { Edit2Icon, MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import SeasonEditForm from "../forms/SeasonEditForm";
import { Season } from "@/entities/season/Season.schema";
import { CurrencyTypes } from "@/entities/common/Types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrencySymbol } from "@/entities/player-fee-category/PlayerFeeCategory.utils";

type SeasonItemProps = {
  season: Season;
  currency: CurrencyTypes;
};

export default function SeasonItem({ season, currency }: SeasonItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen && !isDropdownOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Season"
      >
        <SeasonEditForm
          season={season}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
          currency={currency}
        />
      </ResponsiveSheet>

      <Card key={season.id}>
        <CardHeader className="bg-secondary/50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                {season.customName || "Season"}
              </span>
              <CardTitle className="text-base font-semibold">
                {format(season.startDate, "dd MMM yyyy")} -{" "}
                {format(season.endDate, "dd MMM yyyy")}
              </CardTitle>
            </div>
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-background/20 data-[state=open]:bg-background/20"
                  size="sm"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px] z-50">
                <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                  <button
                    onClick={() => {
                      setIsEditOpen(true);
                    }}
                    className="w-full justify-start items-center gap-2 flex rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                  >
                    <SquarePen className="h-4 w-4" />
                    Edit
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group flex w-full items-center justify-between text-left p-0 text-sm font-medium text-neutral-700">
                  <button
                    onClick={() => {
                      setIsDeleteOpen(true);
                    }}
                    className="w-full justify-start items-center gap-2 flex text-red-500 rounded-md p-2 transition-all duration-75 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="pb-4">
                <h3 className="font-semibold text-sm text-foreground">
                  Membership Fees
                </h3>
              </div>
              {season.membershipPrices.length > 0 ? (
                <div className="space-y-2">
                  {season.membershipPrices.map((price) => (
                    <div key={price.id} className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {price.membershipCategory.name}
                      </span>
                      <span className="text-sm font-medium">
                        {getCurrencySymbol(currency)}
                        {price.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No membership prices set
                </p>
              )}
            </div>

            <div>
              <div className="pb-4">
                <h3 className="font-semibold text-sm text-foreground">
                  Season Breaks
                </h3>
              </div>
              {season.breaks.length > 0 ? (
                <div className="space-y-2">
                  {season.breaks.map((brk, i) => (
                    <div key={i} className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        {format(brk.from, "dd MMM yyyy")} -{" "}
                        {format(brk.to, "dd MMM yyyy")}
                      </span>
                      <span className="text-sm font-medium">
                        {Math.ceil(
                          (brk.to.getTime() - brk.from.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No breaks scheduled
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

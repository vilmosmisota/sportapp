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

      <Card key={season.id} className="">
        <CardHeader className="bg-secondary rounded-t-lg overflow-hidden ">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              <span className="text-muted-foreground mr-3">
                {season.customName ? season.customName : "Season: "}
              </span>
              {format(season.startDate, "dd MMM yy")} -{" "}
              {format(season.endDate, "dd MMM yy")}
            </CardTitle>
            <div>
              <DropdownMenu onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-gray-200"
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
          </div>
        </CardHeader>
        <CardContent className="space-y-3 mt-3">
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-2">
              Membership Prices:
            </p>
            {season.membershipPrices.length ? (
              <Table className="w-full rounded-lg border">
                <TableHeader className="bg-secondary  rounded-t-lg ">
                  <TableRow>
                    <TableHead className="font-medium">Category</TableHead>
                    <TableHead className="font-medium">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {season.membershipPrices.map((membershipPrice) => (
                    <TableRow key={membershipPrice.id}>
                      <TableCell>
                        <p className="text-sm text-neutral-600">
                          {membershipPrice.membershipCategory.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-neutral-600">
                          {getCurrencySymbol(currency)}
                          {membershipPrice.price}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-neutral-600">No membership prices</p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-2">
              Breaks:
            </p>
            <Table className="w-full border">
              <TableHeader className="bg-secondary rounded-t-lg ">
                <TableRow>
                  <TableHead className="font-medium">Date Range</TableHead>
                  <TableHead className="font-medium">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {season.breaks.map((brk, i) => (
                  <TableRow key={i} className="even:bg-inherit">
                    <TableCell>
                      <p className="text-sm text-neutral-600">
                        {format(brk.from, "MMM dd, yyyy")} -{" "}
                        {format(brk.to, "MMM dd, yyyy")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-neutral-600">
                        {Math.ceil(
                          (brk.to.getTime() - brk.from.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
                {season.breaks.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center h-24 text-neutral-600"
                    >
                      No breaks added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

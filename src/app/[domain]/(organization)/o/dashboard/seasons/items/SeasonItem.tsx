"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { format } from "date-fns";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Season } from "@/entities/season/Season.schema";
import { cn } from "@/libs/tailwind/utils";
import { Badge } from "@/components/ui/badge";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { getCurrencySymbol } from "@/entities/player-fee-category/PlayerFeeCategory.utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteSeason } from "@/entities/season/Season.actions.client";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { toast } from "sonner";
import { SeasonEditForm } from "../forms/SeasonEditForm";

type SeasonItemProps = {
  season: Season;
  tenantId: string;
  domain: string;
};

export function SeasonItem({ season, tenantId, domain }: SeasonItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: tenant } = useTenantByDomain(domain);

  const deleteSeason = useDeleteSeason(tenantId);

  const handleDelete = (seasonId: string) => {
    deleteSeason.mutate(seasonId, {
      onSuccess: () => {
        toast.success("Season deleted successfully");
        setIsDeleteOpen(false);
      },
      onError: (error) => {
        toast.error("Failed to delete season");
        console.error("Delete error:", error);
        setIsDeleteOpen(false);
      },
    });
  };

  const ActionMenu = () => (
    <DropdownMenu modal={false}>
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
  );

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Season"
      >
        <SeasonEditForm
          season={season}
          tenantId={tenantId}
          domain={domain}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={season.id.toString()}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete this season and all associated membership prices. Are you sure you want to proceed?"
        onConfirm={handleDelete}
      />

      <Card key={season.id} className="overflow-hidden">
        <CardHeader className="bg-secondary/50 rounded-t-lg px-4 py-3 md:px-6 md:py-4">
          <div className="flex justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {season.customName || "Season"}
                </span>
                {season.isActive && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-secondary/80 hover:bg-secondary/80"
                  >
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm md:text-base font-semibold break-words">
                <span className="block md:inline">
                  {format(season.startDate, "dd MMM yyyy")}
                </span>
                <span className="mx-1">-</span>
                <span className="block md:inline">
                  {format(season.endDate, "dd MMM yyyy")}
                </span>
              </CardTitle>
            </div>
            <ActionMenu />
          </div>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="pb-3 md:pb-4">
                <h3 className="font-semibold text-sm text-foreground">
                  Season Breaks
                </h3>
              </div>
              {season.breaks.length > 0 ? (
                <div className="space-y-2 divide-y divide-border">
                  {season.breaks.map((brk, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex flex-col md:flex-row md:items-center justify-between",
                        "py-2 gap-1 md:gap-4"
                      )}
                    >
                      <span className="text-sm text-muted-foreground">
                        <span className="block md:inline">
                          {format(brk.from, "dd MMM yyyy")}
                        </span>
                        <span className="mx-1">-</span>
                        <span className="block md:inline">
                          {format(brk.to, "dd MMM yyyy")}
                        </span>
                      </span>
                      <span className="text-sm font-medium whitespace-nowrap">
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

            <div>
              <div className="pb-3 md:pb-4">
                <h3 className="font-semibold text-sm text-foreground">
                  Season Phases
                </h3>
              </div>
              {season.phases && season.phases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {season.phases.map((phase, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-secondary/80 hover:bg-secondary/80"
                    >
                      {phase}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No phases set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

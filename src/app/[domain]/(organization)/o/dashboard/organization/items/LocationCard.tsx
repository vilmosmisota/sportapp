"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Location } from "@/entities/common/Location.schema";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import EditGameLocationForm from "../forms/EditGameLocationForm";
import { Tenant } from "@/entities/tenant/Tenant.schema";

interface LocationCardProps {
  location: Location;
  tenant: Tenant;
  canManage: boolean;
  type: "training" | "game";
}

export function LocationCard({
  location,
  tenant,
  canManage,
  type,
}: LocationCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateTenant = useUpdateTenant(tenant.id.toString(), tenant.domain);

  const handleDelete = async () => {
    const currentLocations =
      type === "training" ? tenant.trainingLocations : tenant.gameLocations;
    const updatedLocations =
      currentLocations?.filter((loc) => loc.id !== location.id) ?? [];

    const updateData = {
      name: tenant.name,
      type: tenant.type,
      domain: tenant.domain,
      sport: tenant.sport,
      membershipCurrency: tenant.membershipCurrency,
      lateThresholdMinutes: tenant.lateThresholdMinutes,
      email: tenant.email ?? undefined,
      description: tenant.description ?? undefined,
      logo: tenant.logo ?? undefined,
      location: tenant.location ?? undefined,
      phoneNumber: tenant.phoneNumber ?? undefined,
      groupTypes: tenant.groupTypes ?? undefined,
      trainingLocations:
        type === "training"
          ? updatedLocations
          : tenant.trainingLocations ?? undefined,
      gameLocations:
        type === "game" ? updatedLocations : tenant.gameLocations ?? undefined,
    };

    try {
      await updateTenant.mutateAsync(updateData);
      toast.success(
        `${
          type === "training" ? "Training" : "Game"
        } location deleted successfully`
      );
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error(
        `Failed to delete ${type === "training" ? "training" : "game"} location`
      );
    }
  };

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title={`Edit ${type === "training" ? "Training" : "Game"} Location`}
      >
        <div className="p-4">
          <EditGameLocationForm
            location={location}
            tenantId={tenant.id.toString()}
            domain={tenant.domain}
            setIsOpen={setIsEditOpen}
          />
        </div>
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={location.id}
        text={`This will permanently delete this ${
          type === "training" ? "training" : "game"
        } location. Are you sure you want to proceed?`}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        onConfirm={handleDelete}
      />

      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary/50 rounded-t-lg px-4 py-3 md:px-6 md:py-4">
          <div className="flex justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base font-semibold">
                {location.name}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {location.streetAddress}, {location.city}, {location.postcode}
              </span>
            </div>
            {canManage && (
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
                  <DropdownMenuItem
                    onClick={() => setIsEditOpen(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <SquarePen className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-2 cursor-pointer text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
          {location.mapLink && (
            <a
              href={location.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View on Map
            </a>
          )}
        </CardContent>
      </Card>
    </>
  );
}

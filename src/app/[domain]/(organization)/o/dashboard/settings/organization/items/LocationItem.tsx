"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Tenant, TrainingLocation } from "@/entities/tenant/Tenant.schema";
import { cn } from "@/libs/tailwind/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import EditLocationForm from "../forms/EditLocationForm";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { ConfirmDeleteDialog } from "../../../../../../../../components/ui/confirm-alert";

type LocationItemProps = {
  location: TrainingLocation;
  tenant: Tenant;
};

export default function LocationItem({ location, tenant }: LocationItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutateAsync: updateTenant } = useUpdateTenant(
    tenant.id.toString(),
    tenant.domain
  );

  const handleDelete = async () => {
    try {
      const updatedLocations =
        tenant.trainingLocations?.filter((loc) => loc.id !== location.id) || [];

      const formData = {
        name: tenant.name,
        type: tenant.type,
        domain: tenant.domain,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        trainingLocations: updatedLocations,
        email: tenant.email ?? undefined,
        description: tenant.description ?? undefined,
        logo: tenant.logo ?? undefined,
        location: tenant.location ?? undefined,
        phoneNumber: tenant.phoneNumber ?? undefined,
        groupTypes: tenant.groupTypes ?? undefined,
        lateThresholdMinutes: tenant.lateThresholdMinutes ?? null,
        isPublicSitePublished: tenant.isPublicSitePublished,
      };

      await updateTenant(formData);
      toast.success("Location deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete location");
    }
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
        title="Edit Location"
      >
        <EditLocationForm
          location={location}
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={location.id || ""}
        text="This will permanently delete this location. Are you sure you want to proceed?"
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
            <ActionMenu />
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

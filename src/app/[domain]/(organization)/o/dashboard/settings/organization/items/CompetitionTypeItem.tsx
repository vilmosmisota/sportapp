"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { Tenant, CompetitionType } from "@/entities/tenant/Tenant.schema";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// Default color matching theme - same as in AddTeamForm
const DEFAULT_COLOR = "#4f46e5"; // Indigo color

interface CompetitionTypeItemProps {
  competitionType: CompetitionType;
  tenant: Tenant;
  onEdit: (competitionType: CompetitionType) => void;
}

export default function CompetitionTypeItem({
  competitionType,
  tenant,
  onEdit,
}: CompetitionTypeItemProps) {
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);
  const { name, color } = competitionType;

  const handleDelete = async () => {
    try {
      // Get existing competition types or initialize as empty array
      const existingTypes = tenant.competitionTypes || [];

      // Filter out this competition type
      const competitionTypes = existingTypes.filter(
        (type) => type.name !== name
      );

      // Update tenant
      await tenantUpdate.mutateAsync({
        name: tenant.name,
        domain: tenant.domain,
        type: tenant.type,
        email: tenant.email || undefined,
        description: tenant.description || undefined,
        logo: tenant.logo || undefined,
        location: tenant.location || undefined,
        phoneNumber: tenant.phoneNumber || undefined,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        groupTypes: tenant.groupTypes || undefined,
        trainingLocations: tenant.trainingLocations || undefined,
        gameLocations: tenant.gameLocations || undefined,
        lateThresholdMinutes: tenant.lateThresholdMinutes,
        isPublicSitePublished: tenant.isPublicSitePublished,
        competitionTypes,
      });

      toast.success(`Competition type "${name}" removed`);
    } catch (error) {
      toast.error("Failed to remove competition type");
      console.error("Error removing competition type:", error);
    }
  };

  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: color || DEFAULT_COLOR }}
            />
            <span className="font-medium">{name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(competitionType)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

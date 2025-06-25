"use client";

// Entity Types & Schemas
import { Season } from "@/entities/season/Season.schema";
import { Location } from "@/entities/shared/Location.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";

// Calendar Composite
import { SessionForm } from "@/composites/calendar";

interface Props {
  selectedSeason: Season;
  tenant: Tenant;
  groupId: number;
  setIsOpen: (open: boolean) => void;
  initialDate?: Date | null;
  locations: Location[];
}

export default function AddSessionForm({
  selectedSeason,
  tenant,
  groupId,
  setIsOpen,
  initialDate,
  locations,
}: Props) {
  return (
    <SessionForm
      tenant={tenant}
      season={selectedSeason}
      locations={locations}
      groupId={groupId}
      initialDate={initialDate || undefined}
      onSuccess={() => setIsOpen(false)}
      onCancel={() => setIsOpen(false)}
    />
  );
}

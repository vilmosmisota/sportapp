import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Season } from "@/entities/season/Season.schema";
import { Team } from "@/entities/team/Team.schema";
import CreateTrainingScheduleForm from "../forms/CreateTrainingScheduleForm";
import { useUserRoles } from "../../../../../../../entities/user/hooks/useUserRoles";
import { Permissions } from "../../../../../../../libs/permissions/permissions";

interface Props {
  domain: string;
  selectedSeason: Season | null;
  teams: Team[];
  tenantId: string;
}

export default function CreateTrainingButton({
  domain,
  selectedSeason,
  teams,
  tenantId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const userEntity = useUserRoles();
  const canManageTrainings = Permissions.Teams.manage(userEntity);

  if (!canManageTrainings) return null;

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Training
      </Button>

      <ResponsiveSheet
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Create Training Schedule"
      >
        <CreateTrainingScheduleForm
          tenantId={tenantId}
          domain={domain}
          selectedSeason={selectedSeason}
          teams={teams}
          setIsOpen={setIsOpen}
        />
      </ResponsiveSheet>
    </>
  );
}

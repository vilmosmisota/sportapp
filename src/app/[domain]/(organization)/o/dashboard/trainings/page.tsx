"use client";

import { useEffect, useState } from "react";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useGroupedTrainings } from "@/entities/training/Training.query";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Season } from "@/entities/season/Season.schema";
import SeasonSelect from "./components/SeasonSelect";
import CreateTrainingButton from "./components/CreateTrainingButton";
import EditTrainingForm from "./forms/EditTrainingForm";
import { CalendarWeekView } from "./components/CalendarWeekView";
import { format } from "date-fns";
import { GroupedTraining } from "@/entities/training/Training.schema";
import {
  useUpdateTrainingPattern,
  useDeleteTrainingPattern,
} from "@/entities/training/Training.actions.client";
import { toast } from "sonner";

export default function TrainingsPage({
  params,
}: {
  params: { domain: string };
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] =
    useState<GroupedTraining | null>(null);

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: teams } = useGetTeamsByTenantId(tenant?.id.toString() ?? "");
  const { data: seasons } = useSeasonsByTenantId(tenant?.id.toString() ?? "");
  const { data: selectedSeason } = useSeasonsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const activeSeason = selectedSeason?.find((s: Season) => s.isActive) ?? null;

  const { data: groupedTrainings, error } = useGroupedTrainings(
    tenant?.id.toString() ?? "",
    activeSeason?.id.toString()
  );

  const updatePattern = useUpdateTrainingPattern();
  const deletePattern = useDeleteTrainingPattern();

  const handleEdit = (training: GroupedTraining) => {
    setSelectedTraining(training);
    setIsEditOpen(true);
  };

  const handleDelete = (training: GroupedTraining) => {
    setSelectedTraining(training);
    setIsDeleteOpen(true);
  };

  const handleUpdatePattern = async (
    training: GroupedTraining,
    updates: { startTime?: string; endTime?: string; location?: any }
  ) => {
    if (!tenant || !activeSeason) return;

    try {
      await updatePattern.mutateAsync({
        tenantId: tenant.id,
        patternId: `${training.teamId}-${training.startTime}-${training.endTime}`,
        updates: {
          ...updates,
          seasonId: activeSeason.id,
          originalStartTime: training.startTime,
          originalEndTime: training.endTime,
          fromDate: training.firstDate,
        },
      });
      toast.success("Training pattern updated successfully");
    } catch (error) {
      console.error("Error updating training pattern:", error);
      toast.error("Failed to update training pattern");
    }
  };

  const handleDeletePattern = async (training: GroupedTraining) => {
    if (!tenant || !activeSeason) return;

    try {
      await deletePattern.mutateAsync({
        tenantId: tenant.id,
        patternId: `${training.teamId}-${training.startTime}-${training.endTime}`,
        params: {
          seasonId: activeSeason.id,
          originalStartTime: training.startTime,
          originalEndTime: training.endTime,
          fromDate: training.firstDate,
        },
      });
      setIsDeleteOpen(false);
      toast.success("Training pattern deleted successfully");
    } catch (error) {
      console.error("Error deleting training pattern:", error);
      toast.error("Failed to delete training pattern");
    }
  };

  useEffect(() => {}, [groupedTrainings, error]);

  if (!tenant) return null;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-4 space-y-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Trainings</h3>
          <p className="text-muted-foreground">
            {activeSeason ? (
              <>
                Training schedule for{" "}
                <span className="font-medium">
                  {activeSeason.customName ??
                    `${format(
                      new Date(activeSeason.startDate),
                      "dd/MM/yyyy"
                    )} - ${format(
                      new Date(activeSeason.endDate),
                      "dd/MM/yyyy"
                    )}`}
                </span>
              </>
            ) : (
              "Manage your training schedules and sessions"
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SeasonSelect
            seasons={seasons ?? []}
            selectedSeason={activeSeason}
            tenantId={tenant.id.toString()}
          />
          <CreateTrainingButton
            domain={params.domain}
            selectedSeason={activeSeason}
            teams={teams ?? []}
            tenantId={tenant.id.toString()}
          />
        </div>
      </div>

      <CalendarWeekView
        trainings={groupedTrainings ?? []}
        canManage={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdatePattern={handleUpdatePattern}
      />

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Training Schedule"
      >
        {selectedTraining && (
          <EditTrainingForm
            training={selectedTraining}
            setIsOpen={setIsEditOpen}
            domain={params.domain}
            tenantId={tenant.id}
            seasonId={activeSeason?.id ?? 0}
          />
        )}
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={selectedTraining?.teamId?.toString() ?? ""}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete all future training sessions in this pattern. Are you sure you want to proceed?"
        onConfirm={() => {
          if (selectedTraining) {
            handleDeletePattern(selectedTraining);
          }
        }}
      />
    </>
  );
}

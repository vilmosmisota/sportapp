"use client";

import { useEffect, useState } from "react";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import {
  useGroupedTrainings,
  useTrainingsByDayRange,
} from "@/entities/training/Training.query";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Season } from "@/entities/season/Season.schema";
import SeasonSelect from "./components/SeasonSelect";
import CreateTrainingButton from "./components/CreateTrainingButton";
import EditTrainingForm from "./forms/EditTrainingForm";
import EditTrainingPatternItemsForm from "./forms/EditTrainingPatternItemsForm";
import { CalendarWeekView } from "./components/CalendarWeekView";
import { UpcomingTrainingsCarousel } from "./components/UpcomingTrainingsCarousel";
import { format } from "date-fns";
import { GroupedTraining, Training } from "@/entities/training/Training.schema";
import {
  useUpdateTrainingPattern,
  useDeleteTrainingPattern,
} from "@/entities/training/Training.actions.client";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrainingsPage({
  params,
}: {
  params: { domain: string };
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditItemsOpen, setIsEditItemsOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] =
    useState<GroupedTraining | null>(null);
  const [selectedUpcomingTraining, setSelectedUpcomingTraining] =
    useState<Training | null>(null);

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

  // Fetch upcoming trainings for the next 7 days
  const { data: upcomingTrainings, isLoading: isLoadingUpcoming } =
    useTrainingsByDayRange(tenant?.id.toString() ?? "", 7);

  const updatePattern = useUpdateTrainingPattern();
  const deletePattern = useDeleteTrainingPattern();

  const handleEditPattern = (training: GroupedTraining) => {
    setSelectedTraining(training);
    setIsEditOpen(true);
  };

  const handleEditIndividual = (training: GroupedTraining) => {
    // For now, this will use the same handler as pattern editing
    // This will need to be implemented separately
    setSelectedTraining(training);
    setIsEditItemsOpen(true);
  };

  const handleDeletePattern = (training: GroupedTraining) => {
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

  const executeDeletePattern = async (training: GroupedTraining) => {
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
    <div className="w-full space-y-6 ">
      <PageHeader
        title="Trainings"
        description={
          activeSeason
            ? `Training schedule for ${
                activeSeason.customName ??
                `${format(
                  new Date(activeSeason.startDate),
                  "dd/MM/yyyy"
                )} - ${format(new Date(activeSeason.endDate), "dd/MM/yyyy")}`
              }`
            : "Manage your training schedules and sessions"
        }
        actions={
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
        }
      />

      {isLoadingUpcoming ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-7 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : (
        <UpcomingTrainingsCarousel trainings={upcomingTrainings ?? []} />
      )}

      <CalendarWeekView
        trainings={groupedTrainings ?? []}
        canManage={true}
        onEdit={handleEditPattern}
        onDelete={handleDeletePattern}
        onEditIndividual={handleEditIndividual}
        onUpdatePattern={handleUpdatePattern}
      />

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Training Pattern"
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

      <ResponsiveSheet
        isOpen={isEditItemsOpen}
        setIsOpen={setIsEditItemsOpen}
        title="Manage Training Sessions"
      >
        {selectedTraining && (
          <EditTrainingPatternItemsForm
            training={selectedTraining}
            setIsOpen={setIsEditItemsOpen}
            domain={params.domain}
            tenantId={tenant.id.toString()}
            seasonId={activeSeason?.id ?? 0}
          />
        )}
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={selectedTraining?.teamId?.toString() ?? ""}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete all future training sessions in this pattern. This action cannot be undone. Are you sure you want to proceed?"
        onConfirm={() => {
          if (selectedTraining) {
            executeDeletePattern(selectedTraining);
          }
        }}
      />
    </div>
  );
}

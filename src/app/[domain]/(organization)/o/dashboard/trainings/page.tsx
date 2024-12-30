"use client";

import { useState } from "react";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useSeasonsByTenantId } from "@/entities/season/Season.query";
import { useGroupedTrainings } from "@/entities/training/Training.query";
import TrainingGrid from "./components/TrainingGrid";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-alert";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Season } from "@/entities/season/Season.schema";
import SeasonSelect from "./components/SeasonSelect";
import CreateTrainingButton from "./components/CreateTrainingButton";
import EditTrainingForm from "./forms/EditTrainingForm";

export default function TrainingsPage({
  params,
}: {
  params: { domain: string };
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);

  const { data: tenant } = useTenantByDomain(params.domain);
  const { data: teams } = useGetTeamsByTenantId(tenant?.id.toString() ?? "");
  const { data: seasons } = useSeasonsByTenantId(tenant?.id.toString() ?? "");
  const { data: selectedSeason } = useSeasonsByTenantId(
    tenant?.id.toString() ?? ""
  );
  const activeSeason = selectedSeason?.find((s: Season) => s.isActive) ?? null;
  const { data: groupedTrainings } = useGroupedTrainings(
    tenant?.id.toString() ?? "",
    activeSeason?.id.toString()
  );

  const handleEdit = (training: any) => {
    setSelectedTraining(training);
    setIsEditOpen(true);
  };

  const handleDelete = (training: any) => {
    setSelectedTraining(training);
    setIsDeleteOpen(true);
  };

  if (!tenant) return null;

  return (
    <div className="container max-w-7xl mx-auto py-4 md:py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trainings</h1>
          <p className="text-muted-foreground">
            Manage your training schedules and sessions
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

      <TrainingGrid
        trainings={groupedTrainings ?? []}
        canManage={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
          />
        )}
      </ResponsiveSheet>

      <ConfirmDeleteDialog
        categoryId={selectedTraining?.id.toString()}
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        text="This will permanently delete this training schedule and all its sessions. Are you sure you want to proceed?"
        onConfirm={() => {
          // Add delete logic here
          setIsDeleteOpen(false);
        }}
      />
    </div>
  );
}

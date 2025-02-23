import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import {
  useCreateOpponent,
  useUpdateOpponent,
} from "@/entities/opponent/Opponent.actions";
import {
  Opponent,
  OpponentFormSchema,
  type OpponentForm,
} from "@/entities/opponent/Opponent.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle } from "lucide-react";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
  TeamGender,
} from "@/entities/team/Team.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useGetTeamsByTenantId } from "@/entities/team/Team.query";
import { useMemo } from "react";
import { useState, useEffect } from "react";

interface OpponentFormProps {
  tenantId: string;
  opponent?: Opponent;
  setIsOpen: (value: boolean) => void;
  tenant: Tenant;
}

interface TeamTableProps {
  teams: any[];
  selectedTeamIds: number[];
  onToggleTeam: (teamId: number) => void;
}

const TeamTable = ({
  teams,
  selectedTeamIds,
  onToggleTeam,
}: TeamTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Age Group</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Skill Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell>
              <Checkbox
                checked={selectedTeamIds.includes(team.id)}
                onCheckedChange={() => onToggleTeam(team.id)}
              />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium">
                {getDisplayAgeGroup(team.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {getDisplayGender(team.gender, team.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {team.skill}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {teams.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No teams available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default function OpponentForm({
  tenantId,
  opponent,
  setIsOpen,
  tenant,
}: OpponentFormProps) {
  const [formKey, setFormKey] = useState(0);
  const [forceReset, setForceReset] = useState(false);
  const createOpponent = useCreateOpponent(tenantId);
  const updateOpponent = useUpdateOpponent(opponent?.id ?? 0, tenantId);
  const { data: allTeams } = useGetTeamsByTenantId(tenantId);

  // Filter out teams that are already opponents
  const teams = useMemo(() => {
    if (!allTeams) return [];
    return allTeams.filter((team) => !team.isOpponent);
  }, [allTeams]);

  const form = useForm<OpponentForm>({
    resolver: zodResolver(OpponentFormSchema),
    defaultValues: opponent
      ? {
          name: opponent.name ?? "",
          location: opponent.location,
          tenantId: Number(tenantId),
          teamIds: opponent.teams?.map((t) => t.id) ?? null,
          teams: opponent.teams ?? null,
        }
      : {
          name: "",
          location: null,
          tenantId: Number(tenantId),
          teamIds: null,
          teams: null,
        },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;
  const hasLocation = watch("location") !== null;
  const selectedTeamIds = watch("teamIds") ?? [];

  const resetFormCompletely = () => {
    form.setValue("name", "");
    form.setValue("location", null);
    form.setValue("teamIds", null);
    form.setValue("tenantId", Number(tenantId));
    form.reset();
    setFormKey((prev) => prev + 1);
    setForceReset(true);
  };

  useEffect(() => {
    if (forceReset) {
      form.reset();
      setForceReset(false);
    }
  }, [forceReset, form]);

  const onSubmit = async (data: OpponentForm) => {
    try {
      // Get the selected teams data
      const selectedTeams = teams.filter((team) =>
        data.teamIds?.includes(team.id)
      );
      const formData = {
        ...data,
        teams: selectedTeams.map((team) => ({
          age: team.age,
          gender: team.gender,
          skill: team.skill,
        })),
      };

      if (opponent) {
        await updateOpponent.mutateAsync(formData);
        toast.success("Opponent updated successfully");
        form.reset();
        setIsOpen(false);
      } else {
        await createOpponent.mutateAsync(formData);
        toast.success("Opponent added successfully");
        form.reset();
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form");
    }
  };

  const onSubmitAndAddAnother = async (data: OpponentForm) => {
    try {
      // Get the selected teams data
      const selectedTeams = teams.filter((team) =>
        data.teamIds?.includes(team.id)
      );
      const formData = {
        ...data,
        teams: selectedTeams.map((team) => ({
          age: team.age,
          gender: team.gender,
          skill: team.skill,
        })),
      };

      await createOpponent.mutateAsync(formData);
      toast.success("Opponent added successfully");
      resetFormCompletely();
    } catch (error: any) {
      console.error("Error adding opponent:", error);
      toast.error(error.message || "Failed to add opponent");
    }
  };

  const onCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const toggleLocation = (checked: boolean) => {
    if (checked) {
      form.setValue("location", {
        id: "",
        name: "",
        postcode: "",
        streetAddress: "",
        city: "",
      });
    } else {
      form.setValue("location", null);
    }
  };

  const toggleTeam = (teamId: number) => {
    const currentTeamIds = form.getValues("teamIds") ?? [];
    const isSelected = currentTeamIds.includes(teamId);

    if (isSelected) {
      form.setValue(
        "teamIds",
        currentTeamIds.filter((id) => id !== teamId),
        { shouldDirty: true }
      );
    } else {
      form.setValue("teamIds", [...currentTeamIds, teamId], {
        shouldDirty: true,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        key={formKey}
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Basic Information
              </h4>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter opponent name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Location Information
                </h4>
                <Switch
                  checked={hasLocation}
                  onCheckedChange={toggleLocation}
                />
              </div>
            </div>

            {hasLocation && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postcode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-[calc(100vw-3rem)] md:w-full rounded-md border">
                {teams && (
                  <TeamTable
                    teams={teams}
                    selectedTeamIds={selectedTeamIds}
                    onToggleTeam={toggleTeam}
                  />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-between bottom-0 left-0 right-0 border-t">
          {!opponent && (
            <div className="pl-4">
              <Button
                type="button"
                onClick={handleSubmit(onSubmitAndAddAnother)}
                disabled={!isDirty || isLoading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          )}
          <FormButtons
            buttonText={opponent ? "Save changes" : "Add and close"}
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

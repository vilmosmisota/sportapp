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
  OpponentGroup,
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

interface GroupTableProps {
  teams: {
    age: string | null;
    gender: string | null;
    skill: string | null;
  }[];
  selectedGroups: OpponentGroup[];
  onToggleGroup: (group: OpponentGroup) => void;
}

const GroupTable = ({
  teams,
  selectedGroups,
  onToggleGroup,
}: GroupTableProps) => {
  // Create unique groups from teams
  const uniqueGroups = useMemo(() => {
    const groupSet = new Set<string>();
    const groups: OpponentGroup[] = [];

    teams.forEach((team) => {
      if (!team.age || !team.gender || !team.skill) return;

      const groupKey = `${team.age}-${team.gender}-${team.skill}`;
      if (!groupSet.has(groupKey)) {
        groupSet.add(groupKey);
        // Remove lowercase conversion and directly use the team gender
        const gender = team.gender;
        // Convert gender to TeamGender enum
        let teamGender: TeamGender;
        switch (gender) {
          case "Male":
            teamGender = TeamGender.Male;
            break;
          case "Female":
            teamGender = TeamGender.Female;
            break;
          case "Mixed":
            teamGender = TeamGender.Mixed;
            break;
          default:
            return; // Skip invalid genders
        }

        groups.push({
          age: team.age,
          gender: teamGender,
          skill: team.skill,
        });
      }
    });

    return groups;
  }, [teams]);

  const isGroupSelected = (group: OpponentGroup) => {
    return selectedGroups.some(
      (g) =>
        g.age === group.age &&
        g.gender === group.gender &&
        g.skill === group.skill
    );
  };

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
        {uniqueGroups.map((group, index) => (
          <TableRow key={index}>
            <TableCell>
              <Checkbox
                checked={isGroupSelected(group)}
                onCheckedChange={() => onToggleGroup(group)}
              />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium">
                {getDisplayAgeGroup(group.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {getDisplayGender(group.gender, group.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {group.skill}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {uniqueGroups.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No groups available
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
  const { data: teams } = useGetTeamsByTenantId(tenantId);

  const form = useForm<OpponentForm>({
    resolver: zodResolver(OpponentFormSchema),
    defaultValues: opponent
      ? {
          name: opponent.name ?? "",
          location: opponent.location,
          tenantId: Number(tenantId),
          groups: opponent.groups ?? [],
        }
      : {
          name: "",
          location: null,
          tenantId: Number(tenantId),
          groups: [],
        },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;
  const hasLocation = watch("location") !== null;
  const groups = watch("groups") ?? [];

  const resetFormCompletely = () => {
    // Reset all form fields explicitly
    form.setValue("name", "");
    form.setValue("location", null);
    form.setValue("groups", []);
    form.setValue("tenantId", Number(tenantId));

    // Then trigger the form reset
    form.reset();

    // Force a re-render
    setFormKey((prev) => prev + 1);
    setForceReset(true);
  };

  // Add effect to handle force reset
  useEffect(() => {
    if (forceReset) {
      form.reset();
      setForceReset(false);
    }
  }, [forceReset, form]);

  const onSubmit = async (data: OpponentForm) => {
    if (opponent) {
      updateOpponent.mutate(data, {
        onSuccess: () => {
          toast.success("Opponent updated successfully");
          form.reset();
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to update opponent");
        },
      });
    } else {
      createOpponent.mutate(data, {
        onSuccess: () => {
          toast.success("Opponent added successfully");
          form.reset();
          setIsOpen(false);
        },
        onError: () => {
          toast.error("Failed to add opponent");
        },
      });
    }
  };

  const onSubmitAndAddAnother = async (data: OpponentForm) => {
    try {
      await createOpponent.mutateAsync(data);
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

  const toggleGroup = (group: OpponentGroup) => {
    const currentGroups = form.getValues("groups") ?? [];
    const isSelected = currentGroups.some(
      (g) =>
        g.age === group.age &&
        g.gender === group.gender &&
        g.skill === group.skill
    );

    if (isSelected) {
      form.setValue(
        "groups",
        currentGroups.filter(
          (g) =>
            !(
              g.age === group.age &&
              g.gender === group.gender &&
              g.skill === group.skill
            )
        ),
        { shouldDirty: true }
      );
    } else {
      form.setValue("groups", [...currentGroups, group], { shouldDirty: true });
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
          {/* Basic Information */}
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

          {/* Location Information */}
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

          {/* Groups Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-[calc(100vw-3rem)] md:w-full rounded-md border">
                {teams && (
                  <GroupTable
                    teams={teams}
                    selectedGroups={groups}
                    onToggleGroup={toggleGroup}
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

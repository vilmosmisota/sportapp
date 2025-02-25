import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTeam } from "@/entities/team/Team.actions.client";
import {
  Team,
  TeamForm,
  TeamGender,
  createTeamFormSchema,
} from "@/entities/team/Team.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGetCoachesByTenantId } from "@/entities/team/Team.query";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Palette, Eye } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { TeamBadge } from "@/components/ui/team-badge";
import { useWatch } from "react-hook-form";
import { cn } from "@/libs/utils";

type EditTeamFormProps = {
  team: Team;
  tenantId: string;
  domain: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

function PreviewBadge({ control }: { control: any }) {
  const age = useWatch({ control, name: "age" });
  const gender = useWatch({ control, name: "gender" });
  const skill = useWatch({ control, name: "skill" });
  const color = useWatch({ control, name: "appearance.color" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            This is how the team badge will appear throughout the application:
          </p>
          <div className="flex items-center h-12 border rounded-md px-4 bg-muted/10">
            <TeamBadge
              team={{
                age,
                gender,
                skill,
                appearance: color ? { color } : undefined,
              }}
              size="default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditTeamForm({
  team,
  tenantId,
  domain,
  setIsParentModalOpen,
}: EditTeamFormProps) {
  const { ageGroups, skillLevels } = useTenantGroupTypes(domain);
  const updateTeam = useUpdateTeam(team.id, tenantId);
  const { data: coaches } = useGetCoachesByTenantId(tenantId);

  const TeamFormSchema = createTeamFormSchema(ageGroups, skillLevels);

  const form = useForm<TeamForm>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: {
      age: team.age ?? ageGroups[0],
      skill: team.skill ?? skillLevels[0],
      gender: team.gender as TeamGender,
      coachId: team.coachId ?? undefined,
      appearance: {
        color: team.appearance?.color ?? undefined,
      },
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TeamForm) => {
    updateTeam.mutate(data, {
      onSuccess: () => {
        toast.success("Team updated successfully");
        setIsParentModalOpen?.(false);
      },
      onError: () => {
        toast.error("Failed to update team");
      },
    });
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Preview */}
          <PreviewBadge control={form.control} />

          {/* Team Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ageGroups.map((age) => (
                          <SelectItem key={age} value={age}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TeamGender).map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skillLevels.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a coach" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coaches?.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            {coach.firstName} {coach.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="appearance.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Color</FormLabel>
                    <FormDescription>
                      Choose a color to customize the team&apos;s badge. This
                      color will be used to identify the team throughout the
                      application.
                    </FormDescription>
                    <FormControl>
                      <ColorPicker
                        value={field.value ?? undefined}
                        onChange={(color) => field.onChange(color)}
                        className={cn(
                          "hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Save"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

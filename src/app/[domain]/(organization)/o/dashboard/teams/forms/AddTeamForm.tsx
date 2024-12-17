import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddTeamToTenant } from "@/entities/team/Team.actions.client";
import {
  AgeLevel,
  Gender,
  SkillLevel,
  TeamForm,
  TeamFormSchema,
} from "@/entities/team/Team.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type AddTeamFormProps = {
  tenantId: string;
};

export default function AddTeamForm({ tenantId }: AddTeamFormProps) {
  const addTeam = useAddTeamToTenant(tenantId);

  const form = useForm<TeamForm>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: {
      age: null,
      skill: "",
      gender: "",
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TeamForm) => {
    addTeam.mutate(data, {
      onSuccess: () => {
        toast.success("Team updated");
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update organization");
        console.error("Failed to update organization");
      },
    });
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 relative "
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-3">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Age</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an age group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AgeLevel).map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="skill"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Skill</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(SkillLevel).map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Gender).map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-white sticky h-[100px] flex items-center justify-center bottom-0 left-0 right-0 border-t">
          <Button type="submit" className="w-full" disabled={!isDirty}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

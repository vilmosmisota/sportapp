"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tenant, TenantForm } from "@/entities/tenant/Tenant.schema";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";
import { useTenantGroupTypes } from "@/entities/tenant/hooks/useGroupTypes";
import FormButtons from "@/components/ui/form-buttons";

interface AddGroupTypeFormProps {
  tenant?: Tenant;
  setIsParentModalOpen: (value: boolean) => void;
}

const formSchema = z.object({
  ageGroups: z.array(
    z.object({
      minAge: z.number().min(0, "Minimum age must be at least 0"),
      maxAge: z.number().min(0, "Maximum age must be at least 0"),
      name: z.string().min(1, "Value is required"),
    })
  ),
  skillLevels: z.array(z.string().min(1, "Value is required")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddGroupTypeForm({
  tenant,
  setIsParentModalOpen,
}: AddGroupTypeFormProps) {
  const { ageGroups, skillLevels } = useTenantGroupTypes(tenant);
  const updateTenant = useUpdateTenant(
    tenant?.id.toString() ?? "",
    tenant?.domain ?? ""
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageGroups: ageGroups.length
        ? ageGroups.map((group) => {
            const [name, range] = group.split("#");
            if (range) {
              const [min, max] = range.split("-").map(Number);
              return { name, minAge: min, maxAge: max };
            }
            return {
              name: group,
              minAge: 0,
              maxAge: parseInt(group.replace(/\D/g, "")) || 0,
            };
          })
        : [{ name: "", minAge: 0, maxAge: 0 }],
      skillLevels: skillLevels.length ? skillLevels : [""],
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    const groupTypes = {
      ageGroups: data.ageGroups
        .filter(
          (group) =>
            group.name && group.minAge >= 0 && group.maxAge >= group.minAge
        )
        .map((group) => {
          const name = group.name.trim();
          const formattedName = name.toLowerCase().startsWith("u")
            ? name.toUpperCase()
            : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          return `${formattedName}#${group.minAge}-${group.maxAge}`;
        }),
      skillLevels: data.skillLevels
        .filter(Boolean)
        .map((value) => value.trim())
        .map(
          (value) =>
            value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        ),
    };

    const updateData: TenantForm = {
      name: tenant.name,
      type: tenant.type,
      domain: tenant.domain,
      sport: tenant.sport,
      membershipCurrency: tenant.membershipCurrency,
      lateThresholdMinutes: tenant.lateThresholdMinutes,
      isPublicSitePublished: tenant.isPublicSitePublished,
    };

    updateTenant.mutate(updateData, {
      onSuccess: () => {
        toast.success("Group types updated successfully");
        setIsParentModalOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const addAgeGroup = () => {
    const currentAgeGroups = form.getValues("ageGroups");
    form.setValue("ageGroups", [
      ...currentAgeGroups,
      { name: "", minAge: 0, maxAge: 0 },
    ]);
  };

  const removeAgeGroup = (index: number) => {
    const currentAgeGroups = form.getValues("ageGroups");
    form.setValue(
      "ageGroups",
      currentAgeGroups.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      }
    );
  };

  const addSkillLevel = () => {
    const currentSkillLevels = form.getValues("skillLevels");
    form.setValue("skillLevels", [...currentSkillLevels, ""]);
  };

  const removeSkillLevel = (index: number) => {
    const currentSkillLevels = form.getValues("skillLevels");
    form.setValue(
      "skillLevels",
      currentSkillLevels.filter((_, i) => i !== index),
      {
        shouldDirty: true,
      }
    );
  };

  const { isDirty, isSubmitting } = form.formState;

  // Add helper function to suggest age group name
  const suggestAgeGroupName = (minAge: number, maxAge: number) => {
    // For adult and senior categories, we care more about the minimum age
    if (minAge >= 35) {
      return "Senior";
    }
    if (minAge >= 20) {
      return "Adult";
    }
    // For youth categories, we care more about the maximum age
    return `U${maxAge}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-base font-semibold">Age Groups</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Define age ranges for your teams
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgeGroup}
                className="h-9 px-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Age Group
              </Button>
            </div>
            <div className="space-y-6">
              {form.watch("ageGroups").map((_, index) => (
                <div
                  key={index}
                  className="relative flex gap-4 items-start p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`ageGroups.${index}.minAge`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Min Age
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value) || 0);
                                  const maxAge = form.getValues(
                                    `ageGroups.${index}.maxAge`
                                  );
                                  const suggestedName = suggestAgeGroupName(
                                    parseInt(e.target.value) || 0,
                                    maxAge
                                  );
                                  form.setValue(
                                    `ageGroups.${index}.name`,
                                    suggestedName
                                  );
                                }}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ageGroups.${index}.maxAge`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              Max Age
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseInt(e.target.value) || 0);
                                  const minAge = form.getValues(
                                    `ageGroups.${index}.minAge`
                                  );
                                  const suggestedName = suggestAgeGroupName(
                                    minAge,
                                    parseInt(e.target.value) || 0
                                  );
                                  form.setValue(
                                    `ageGroups.${index}.name`,
                                    suggestedName
                                  );
                                }}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`ageGroups.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Age Group Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-9"
                              placeholder="e.g. U12"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Suggestions are automatic based on age range, but
                            you can customize this name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAgeGroup(index)}
                    className="h-9 w-9 absolute -top-2 -right-2 bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-base font-semibold">Skill Levels</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Define skill levels for your teams
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkillLevel}
                className="h-9 px-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Skill Level
              </Button>
            </div>
            <div className="space-y-4">
              {form.watch("skillLevels").map((_, index) => (
                <div
                  key={index}
                  className="relative flex gap-4 items-start p-4 rounded-lg border bg-card"
                >
                  <FormField
                    control={form.control}
                    name={`skillLevels.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            className="h-9"
                            placeholder="e.g. Beginner"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkillLevel(index)}
                    className="h-9 w-9 absolute -top-2 -right-2 bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Save Changes"
            isLoading={isSubmitting}
            isDirty={isDirty}
            onCancel={() => setIsParentModalOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}

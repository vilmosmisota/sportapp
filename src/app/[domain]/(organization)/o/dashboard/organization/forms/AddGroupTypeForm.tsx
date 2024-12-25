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
  tenant: Tenant | undefined;
  domain: string;
  setIsParentModalOpen: (value: boolean) => void;
}

const formSchema = z.object({
  ageGroups: z.array(z.string().min(1, "Value is required")),
  skillLevels: z.array(z.string().min(1, "Value is required")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddGroupTypeForm({
  tenant,
  domain,
  setIsParentModalOpen,
}: AddGroupTypeFormProps) {
  const { ageGroups, skillLevels } = useTenantGroupTypes(domain);
  const updateTenant = useUpdateTenant(
    tenant?.id.toString() ?? "",
    tenant?.domain ?? ""
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageGroups: ageGroups.length ? ageGroups : [""],
      skillLevels: skillLevels.length ? skillLevels : [""],
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    const groupTypes = {
      ageGroups: data.ageGroups
        .filter(Boolean)
        .map((value) => value.trim())
        .map((value) => {
          if (value.toLowerCase().startsWith("u")) {
            return value.toUpperCase();
          }
          return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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
      groupTypes,
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
    form.setValue("ageGroups", [...currentAgeGroups, ""]);
  };

  const removeAgeGroup = (index: number) => {
    const currentAgeGroups = form.getValues("ageGroups");
    form.setValue(
      "ageGroups",
      currentAgeGroups.filter((_, i) => i !== index)
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
      currentSkillLevels.filter((_, i) => i !== index)
    );
  };

  const { isDirty, isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Age Groups</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgeGroup}
                className="h-8 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Age Group
              </Button>
            </div>
            {form.watch("ageGroups").map((_, index) => (
              <div key={index} className="flex gap-4 items-start mb-4">
                <FormField
                  control={form.control}
                  name={`ageGroups.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="e.g. U12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAgeGroup(index)}
                  className="mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Skill Levels</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkillLevel}
                className="h-8 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Skill Level
              </Button>
            </div>
            {form.watch("skillLevels").map((_, index) => (
              <div key={index} className="flex gap-4 items-start mb-4">
                <FormField
                  control={form.control}
                  name={`skillLevels.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="e.g. Beginner" />
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
                  className="mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
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

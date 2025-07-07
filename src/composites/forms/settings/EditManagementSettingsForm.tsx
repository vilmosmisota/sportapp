import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import {
  Tenant,
  TenantForm,
  TenantFormSchema,
} from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditManagementSettingsFormProps {
  tenant: Tenant;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditManagementSettingsForm({
  tenant,
  onCancel,
  onSuccess,
}: EditManagementSettingsFormProps) {
  const tenantUpdate = useUpdateTenant(
    tenant.id.toString(),
    tenant.domain,
    tenant.tenantConfigId ?? tenant.tenantConfigs?.id
  );

  const form = useForm<TenantForm>({
    resolver: zodResolver(
      TenantFormSchema.pick({
        tenantConfig: true,
        name: true,
        domain: true,
        type: true,
      })
    ),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        performers: {
          displayName:
            tenant.tenantConfigs?.performers?.displayName ?? "performers",
          slug: tenant.tenantConfigs?.performers?.slug ?? "performers",
        },
        groups: {
          useCustomName: tenant.tenantConfigs?.groups?.useCustomName ?? false,
          displayFields: tenant.tenantConfigs?.groups?.displayFields ?? [
            "ageRange",
          ],
          displaySeparator:
            tenant.tenantConfigs?.groups?.displaySeparator ?? "•",
          levelOptions: tenant.tenantConfigs?.groups?.levelOptions ?? [],
        },
      },
    },
  });

  const { handleSubmit, control, formState, reset } = form;
  const { isDirty, isLoading } = formState;

  const displayFieldsArray = useFieldArray({
    control,
    name: "tenantConfig.groups.displayFields",
  });
  const levelOptionsArray = useFieldArray({
    control,
    name: "tenantConfig.groups.levelOptions",
  });

  const onSubmit = (data: TenantForm) => {
    tenantUpdate.mutate(data, {
      onSuccess: () => {
        toast.success("Management settings updated");
        reset(data);
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to update management settings");
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden fields for required schema fields that aren't editable */}
        <input type="hidden" {...form.register("name")} value={tenant.name} />
        <input
          type="hidden"
          {...form.register("domain")}
          value={tenant.domain}
        />
        <input type="hidden" {...form.register("type")} value={tenant.type} />
        {/* Performers Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Performers Configuration
            </CardTitle>
            <CardDescription>
              Settings for how performers are displayed and managed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="tenantConfig.performers.displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="tenantConfig.performers.slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Groups Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Groups Configuration
            </CardTitle>
            <CardDescription>
              Settings for how groups are displayed and organized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="tenantConfig.groups.useCustomName"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Use Custom Name</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="tenantConfig.groups.displaySeparator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Separator</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <div>
              <FormLabel>Display Fields</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {displayFieldsArray.fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-1">
                    <FormField
                      control={control}
                      name={
                        `tenantConfig.groups.displayFields.${index}` as const
                      }
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} type="text" className="w-28" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={() => displayFieldsArray.remove(index)}
                      aria-label="Remove field"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-blue-500 ml-2"
                  onClick={() => displayFieldsArray.append("")}
                >
                  + Add Field
                </button>
              </div>
            </div>
            <div>
              <FormLabel>Level Options</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {levelOptionsArray.fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-1">
                    <FormField
                      control={control}
                      name={
                        `tenantConfig.groups.levelOptions.${index}` as const
                      }
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} type="text" className="w-28" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={() => levelOptionsArray.remove(index)}
                      aria-label="Remove level"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-blue-500 ml-2"
                  onClick={() => levelOptionsArray.append("")}
                >
                  + Add Level
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white text-sm font-medium shadow hover:bg-primary/90 focus:outline-none"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Form>
  );
}

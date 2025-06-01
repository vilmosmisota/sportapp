import { Button } from "@/components/ui/button";
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
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import {
  Tenant,
  TenantForm,
  TenantFormSchema,
} from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

type EditGroupsFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditGroupsForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditGroupsFormProps) {
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        groups: {
          displayName: tenant.tenantConfigs?.groups?.displayName ?? "Groups",
          slug: tenant.tenantConfigs?.groups?.slug ?? "groups",
          customAgeCategories:
            tenant.tenantConfigs?.groups?.customAgeCategories ?? [],
        },
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tenantConfig.groups.customAgeCategories",
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TenantForm) => {
    tenantUpdate.mutate(data, {
      onSuccess: () => {
        toast.success("Groups settings updated");
        setSheetOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update groups settings");
        console.error("Failed to update groups settings");
      },
    });
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Form submit triggered");
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const addCustomCategory = () => {
    append({
      label: "",
      value: "",
      sortOrder: fields.length,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleFormSubmit}
      >
        {/* Hidden fields for required schema fields that aren't editable */}
        <input type="hidden" {...form.register("name")} />
        <input type="hidden" {...form.register("type")} />
        <input type="hidden" {...form.register("domain")} />

        <div className="space-y-10">
          {/* Display Settings */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Display Settings
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tenantConfig.groups.displayName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Groups" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantConfig.groups.slug"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="groups" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Age Categories */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Age Categories
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add age categories for team organization (U8, U10, Senior,
                    Masters, etc.)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomCategory}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No age categories configured
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Click &quot;Add Category&quot; to create age categories
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end gap-3 p-4 border border-border rounded-lg bg-card"
                  >
                    <FormField
                      control={form.control}
                      name={`tenantConfig.groups.customAgeCategories.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Display Label</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="e.g., U8, Senior"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tenantConfig.groups.customAgeCategories.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="e.g., u8, senior"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tenantConfig.groups.customAgeCategories.${index}.sortOrder`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel>Order</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="0"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mb-0 h-10 w-10 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <FormButtons
          buttonText="Save Changes"
          isLoading={isLoading}
          isDirty={isDirty}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}

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

type EditTrainingDevelopmentFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditTrainingDevelopmentForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditTrainingDevelopmentFormProps) {
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        development: {
          trainingLocations:
            tenant.tenantConfigs?.development?.trainingLocations ?? [],
        },
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tenantConfig.development.trainingLocations",
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TenantForm) => {
    tenantUpdate.mutate(data, {
      onSuccess: () => {
        toast.success("Training & Development settings updated");
        setSheetOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update training & development settings");
        console.error("Failed to update training & development settings");
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

  const addTrainingLocation = () => {
    append({
      name: "",
      streetAddress: "",
      city: "",
      postcode: "",
      mapLink: "",
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
          {/* Training Settings */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Training Settings
              </h4>
            </div>

            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                Training settings have been moved to the Attendance section.
              </p>
            </div>
          </div>

          {/* Training Locations */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Training Locations
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add locations where training sessions are held
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTrainingLocation}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No training locations configured
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Click &quot;Add Location&quot; to add training locations
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-border rounded-lg bg-card space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-foreground">
                        Location {index + 1}
                      </h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name={`tenantConfig.development.trainingLocations.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="e.g., Main Training Ground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tenantConfig.development.trainingLocations.${index}.streetAddress`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="123 Main Street"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`tenantConfig.development.trainingLocations.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="City"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`tenantConfig.development.trainingLocations.${index}.postcode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postcode</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="12345"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`tenantConfig.development.trainingLocations.${index}.mapLink`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Map Link (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://maps.google.com/..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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

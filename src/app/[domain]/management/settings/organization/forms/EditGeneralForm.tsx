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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import {
  Tenant,
  TenantForm,
  TenantFormSchema,
} from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditGeneralFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditGeneralForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditGeneralFormProps) {
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        general: {
          sport: tenant.tenantConfigs?.general?.sport ?? undefined,
          description: tenant.tenantConfigs?.general?.description ?? "",
          location: tenant.tenantConfigs?.general?.location ?? {
            name: "",
            streetAddress: "",
            city: "",
            postcode: "",
            mapLink: "",
          },
        },
      },
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TenantForm) => {
    tenantUpdate.mutate(data, {
      onSuccess: () => {
        toast.success("General settings updated");
        setSheetOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update general settings");
        console.error("Failed to update general settings");
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

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative "
        onSubmit={handleFormSubmit}
      >
        {/* Hidden fields for required schema fields that aren't editable */}
        <input type="hidden" {...form.register("type")} />
        <input type="hidden" {...form.register("domain")} />

        <div className="space-y-10">
          {/* Organization Details */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Organization Details
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantConfig.general.description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter organization description"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Location Information
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tenantConfig.general.location.name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Location Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="e.g., Main Stadium, Community Center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantConfig.general.location.streetAddress"
                render={({ field }) => (
                  <FormItem className="w-full">
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
                  name="tenantConfig.general.location.city"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="City" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tenantConfig.general.location.postcode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="12345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tenantConfig.general.location.mapLink"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Map Link</FormLabel>
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

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
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditMembersFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditMembersForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditMembersFormProps) {
  const tenantUpdate = useUpdateTenant(
    tenant.id.toString(),
    tenant.domain,
    tenant.tenantConfigId ?? tenant.tenantConfigs?.id
  );

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        performers: {
          displayName:
            tenant.tenantConfigs?.performers?.displayName ?? "Performers",
          slug: tenant.tenantConfigs?.performers?.slug ?? "performers",
        },
      },
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = (data: TenantForm) => {
    // Transform data to lowercase before submitting
    const transformedData: TenantForm = {
      ...data,
      tenantConfig: {
        ...data.tenantConfig,
        performers: data.tenantConfig?.performers
          ? {
              displayName:
                data.tenantConfig.performers.displayName?.toLowerCase() ??
                "performers",
              slug:
                data.tenantConfig.performers.slug?.toLowerCase() ??
                "performers",
            }
          : undefined,
      },
    };

    tenantUpdate.mutate(transformedData, {
      onSuccess: () => {
        toast.success("Performer settings updated");
        setSheetOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update performer settings");
        console.error("Failed to update performer settings");
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
        className="flex flex-col gap-6 relative"
        onSubmit={handleFormSubmit}
      >
        {/* Hidden fields for required schema fields that aren't editable */}
        <input type="hidden" {...form.register("name")} />
        <input type="hidden" {...form.register("type")} />
        <input type="hidden" {...form.register("domain")} />

        <div className="space-y-10">
          {/* Performers Configuration */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Performers Configuration
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Configure how individual performers (players, athletes, etc.)
                are displayed and accessed within your organization.
              </p>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tenantConfig.performers.displayName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Performer Display Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Performers"
                        className="capitalize"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantConfig.performers.slug"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Performer URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="performers"
                        onChange={(e) => {
                          // Convert to lowercase as user types
                          const lowercaseValue = e.target.value.toLowerCase();
                          field.onChange(lowercaseValue);
                        }}
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

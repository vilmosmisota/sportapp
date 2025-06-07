"use client";

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
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditPerformerSettingsFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (open: boolean) => void;
};

// Helper function to convert display name to URL-friendly slug
const generateSlugFromDisplayName = (displayName: string): string => {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

export default function EditPerformerSettingsForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditPerformerSettingsFormProps) {
  const router = useRouter();
  const params = useParams();
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);

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

  const { handleSubmit, watch, setValue } = form;
  const { isDirty, isLoading } = form.formState;

  // Watch the display name to auto-generate slug
  const displayName = watch("tenantConfig.performers.displayName");

  const onSubmit = (data: TenantForm) => {
    // Get the current and new slug values
    const currentSlug = tenant.tenantConfigs?.performers?.slug ?? "performers";
    const newSlug =
      data.tenantConfig?.performers?.slug?.toLowerCase() ?? "performers";
    const slugChanged = currentSlug !== newSlug;

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
              slug: newSlug,
            }
          : undefined,
      },
    };

    tenantUpdate.mutate(transformedData, {
      onSuccess: () => {
        toast.success("Performer settings updated");
        setSheetOpen(false);
        form.reset();

        // If the slug changed, redirect to the new URL
        if (slugChanged) {
          const newUrl = `/management/members/${newSlug}/settings`;
          router.push(newUrl);
        }
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
                Performer Configuration
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
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);

                          // Auto-generate slug from display name
                          if (value.trim()) {
                            const generatedSlug =
                              generateSlugFromDisplayName(value);
                            setValue(
                              "tenantConfig.performers.slug",
                              generatedSlug,
                              {
                                shouldDirty: true,
                              }
                            );
                          }
                        }}
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

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
import { Uploader } from "@/components/ui/uploader";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import {
  Tenant,
  TenantForm,
  TenantFormSchema,
} from "@/entities/tenant/Tenant.schema";
import { R2_PUBLIC_BASE_URL } from "@/libs/upload/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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

  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [oldLogoKey, setOldLogoKey] = React.useState<string | null>(null);

  // Get current logo URL from tenant
  const currentLogoUrl = tenant.tenantConfigs?.general?.logo ?? undefined;

  // Watch logo in form
  const logoUrl = form.watch("tenantConfig.general.logo");

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoError(null);
    if (logoUrl) {
      const key = logoUrl.replace(R2_PUBLIC_BASE_URL + "/", "");
      setOldLogoKey(key || null);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoError(null);
    if (logoUrl) {
      const key = logoUrl.replace(R2_PUBLIC_BASE_URL + "/", "");
      setOldLogoKey(key || null);
    }
    form.setValue("tenantConfig.general.logo", "");
  };

  const onSubmit = async (data: TenantForm) => {
    console.log("oldLogoKey", oldLogoKey);
    console.log("logoFile", logoFile);

    try {
      let finalLogoUrl = data.tenantConfig?.general?.logo;
      if (logoFile) {
        setLogoUploading(true);
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("tenantId", tenant.id.toString());
        formData.append("tenantName", tenant.name);
        formData.append("uploadType", "logo");
        if (oldLogoKey) {
          formData.append("oldFileKey", oldLogoKey);
        }
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        setLogoUploading(false);
        if (!res.ok || !result.url) {
          setLogoError(result.error || "Upload failed");
          toast.error(result.error || "Logo upload failed");
          return;
        }
        finalLogoUrl = result.url;
        form.setValue("tenantConfig.general.logo", finalLogoUrl);
        setOldLogoKey(null);
      }
      const submitData: TenantForm = {
        ...data,
        tenantConfig: {
          ...data.tenantConfig,
          general: {
            ...data.tenantConfig?.general,
            logo: finalLogoUrl,
          },
        },
      };
      tenantUpdate.mutate(submitData, {
        onSuccess: () => {
          toast.success("General settings updated");
          setSheetOpen(false);
          form.reset();
          setLogoFile(null);
        },
        onError: () => {
          toast.error("Failed to update general settings");
          console.error("Failed to update general settings");
        },
      });
    } catch (err: any) {
      setLogoUploading(false);
      setLogoError(err.message || "Upload failed");
      toast.error(err.message || "Logo upload failed");
    }
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

          {/* Logo Upload */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Organization Logo
              </h4>
            </div>
            <Uploader
              value={logoFile}
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              showPreview
              label="Logo"
              description="PNG, JPG, GIF, or WebP. Max 5MB."
              error={logoError || undefined}
              helperText={
                logoUrl ? "Current logo will be replaced." : undefined
              }
              disabled={logoUploading}
              initialUrl={logoUrl || currentLogoUrl}
            />
            {logoUploading && (
              <div className="text-xs text-muted-foreground">Uploading...</div>
            )}
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
          isLoading={isLoading || logoUploading}
          isDirty={isDirty || !!logoFile}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}

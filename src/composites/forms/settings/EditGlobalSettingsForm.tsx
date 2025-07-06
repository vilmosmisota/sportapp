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
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditGlobalSettingsFormProps {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (open: boolean) => void;
}

export default function EditGlobalSettingsForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditGlobalSettingsFormProps) {
  const tenantUpdate = useUpdateTenant(
    tenant.id.toString(),
    tenant.domain,
    tenant.tenantConfigId ?? tenant.tenantConfigs?.id
  );
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        general: {
          sport: tenant.tenantConfigs?.general?.sport ?? undefined,
          logo: tenant.tenantConfigs?.general?.logo ?? undefined,
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

  const { handleSubmit, setValue, watch, formState } = form;
  const { isDirty, isLoading } = formState;
  const logoUrl = watch("tenantConfig.general.logo");

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoError(null);
  };

  const onSubmit = async (data: TenantForm) => {
    try {
      let finalLogoUrl = data.tenantConfig?.general?.logo;
      if (logoFile) {
        setLogoUploading(true);
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("tenantId", tenant.id.toString());
        formData.append("uploadType", "logo");
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
          toast.success("Settings updated");
          setSheetOpen(false);
          form.reset();
          setLogoFile(null);
        },
        onError: () => {
          toast.error("Failed to update settings");
          console.error("Failed to update settings");
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
    setLogoFile(null);
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Hidden fields for required schema fields that aren't editable */}
        <input type="hidden" {...form.register("type")} value={tenant.type} />
        <input
          type="hidden"
          {...form.register("domain")}
          value={tenant.domain}
        />

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
              <FormField
                control={form.control}
                name="tenantConfig.general.sport"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Sport</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="e.g. Football, Basketball"
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

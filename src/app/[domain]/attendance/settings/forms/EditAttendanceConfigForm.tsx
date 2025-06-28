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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import {
  CheckInMode,
  Tenant,
  TenantForm,
  TenantFormSchema,
} from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditAttendanceConfigFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export default function EditAttendanceConfigForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditAttendanceConfigFormProps) {
  const tenantUpdate = useUpdateTenant(tenant.id.toString(), tenant.domain);

  const form = useForm<TenantForm>({
    resolver: zodResolver(TenantFormSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      type: tenant.type,
      tenantConfig: {
        attendance: {
          lateThreshold: tenant.tenantConfigs?.attendance?.lateThreshold ?? 5,
          checkInMode:
            tenant.tenantConfigs?.attendance?.checkInMode ??
            CheckInMode.PIN_4_DIGIT,
          kioskStyling: tenant.tenantConfigs?.attendance?.kioskStyling ?? {
            primaryColor: undefined,
            backgroundColor: undefined,
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
        toast.success("Attendance settings updated");
        setSheetOpen(false);
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update attendance settings");
        console.error("Failed to update attendance settings");
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
          {/* Attendance Settings */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Attendance Settings
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tenantConfig.attendance.lateThreshold"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Late Threshold (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="5"
                        min="0"
                        max="60"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 5)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenantConfig.attendance.checkInMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select check-in mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CheckInMode.PIN_4_DIGIT}>
                          4-Digit PIN
                        </SelectItem>
                        <SelectItem value={CheckInMode.FACE_ID} disabled>
                          Face ID (Coming Soon)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Kiosk Styling - Placeholder */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Kiosk Styling
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customize the appearance of check-in kiosks
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Kiosk styling options coming soon
              </p>
              <p className="text-xs text-muted-foreground/70">
                This will include color themes, logo customization, and layout
                options
              </p>
            </div>
          </div>
        </div>

        <FormButtons
          onCancel={onCancel}
          isLoading={isLoading}
          isDirty={isDirty}
          buttonText="Update Settings"
        />
      </form>
    </Form>
  );
}

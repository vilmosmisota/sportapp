import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Dispatch, SetStateAction } from "react";
import { LocationSchema } from "@/entities/common/Location.schema";

const formSchema = LocationSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

interface AddTrainingLocationFormProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  tenant: Tenant;
}

export default function AddTrainingLocationForm({
  open,
  onOpenChange,
  tenant,
}: AddTrainingLocationFormProps) {
  const { mutateAsync: updateTenant } = useUpdateTenant(
    tenant.id.toString(),
    tenant.domain
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      postcode: "",
      streetAddress: "",
      city: "",
      mapLink: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const newLocation = {
        ...data,
        id: nanoid(),
        postcode: data.postcode.toUpperCase(),
      };

      const updatedLocations = [
        ...(tenant.trainingLocations || []),
        newLocation,
      ];

      const formData = {
        name: tenant.name,
        type: tenant.type,
        domain: tenant.domain,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        trainingLocations: updatedLocations,
        email: tenant.email ?? undefined,
        description: tenant.description ?? undefined,
        logo: tenant.logo ?? undefined,
        location: tenant.location ?? undefined,
        phoneNumber: tenant.phoneNumber ?? undefined,
        groupTypes: tenant.groupTypes ?? undefined,
        lateThresholdMinutes: tenant.lateThresholdMinutes,
        isPublicSitePublished: tenant.isPublicSitePublished,
      };

      await updateTenant(formData);

      toast.success("Training location added successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add training location");
    }
  };

  return (
    <ResponsiveSheet
      isOpen={open}
      setIsOpen={onOpenChange}
      title="Add Training Location"
      description="Add a new location where training sessions take place"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mapLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map Link</FormLabel>
                <FormControl>
                  <Input placeholder="Enter map link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
            <FormButtons
              isLoading={form.formState.isSubmitting}
              onCancel={() => onOpenChange(false)}
              buttonText="Add Location"
              isDirty={form.formState.isDirty}
            />
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}

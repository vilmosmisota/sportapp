import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tenant,
  TrainingLocation,
  TrainingLocationSchema,
} from "@/entities/tenant/Tenant.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Dispatch, SetStateAction } from "react";
import { queryKeys } from "../../../../../../../cacheKeys/cacheKeys";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = TrainingLocationSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

interface EditLocationFormProps {
  location: TrainingLocation;
  tenant: Tenant;
  domain: string;
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
}

export default function EditLocationForm({
  location,
  tenant,
  domain,
  setSheetOpen,
}: EditLocationFormProps) {
  const { mutateAsync: updateTenant } = useUpdateTenant(
    tenant.id.toString(),
    domain
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location.name,
      postcode: location.postcode,
      streetAddress: location.streetAddress,
      city: location.city,
      mapLink: location.mapLink,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const updatedLocation = {
        ...data,
        id: location.id,
        postcode: data.postcode.toUpperCase(),
      };

      await updateTenant({
        name: tenant.name,
        type: tenant.type,
        domain: tenant.domain,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        email: tenant.email ?? undefined,
        description: tenant.description ?? undefined,
        logo: tenant.logo ?? undefined,
        location: tenant.location ?? undefined,
        phoneNumber: tenant.phoneNumber ?? undefined,
        groupTypes: tenant.groupTypes ?? undefined,
        trainingLocations: tenant.trainingLocations?.map((loc) =>
          loc.id === location.id ? updatedLocation : loc
        ) || [updatedLocation],
        lateThresholdMinutes: tenant.lateThresholdMinutes,
      });

      toast.success("Location updated successfully");
      setSheetOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  return (
    <div className="space-y-6 px-4 pb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Main Pool" {...field} />
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
                  <Input placeholder="123 Sports Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="London" {...field} />
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
                  <Input placeholder="SW1A 1AA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mapLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://maps.google.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
            <FormButtons
              onCancel={() => setSheetOpen(false)}
              isLoading={form.formState.isSubmitting}
              buttonText="Save Changes"
              isDirty={form.formState.isDirty}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

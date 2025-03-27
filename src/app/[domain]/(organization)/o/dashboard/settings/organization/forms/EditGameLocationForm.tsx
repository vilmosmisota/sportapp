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
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { LocationSchema } from "@/entities/common/Location.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Location } from "@/entities/common/Location.schema";

const formSchema = LocationSchema;
type FormValues = z.infer<typeof formSchema>;

interface EditGameLocationFormProps {
  location: Location;
  tenantId: string;
  domain: string;
  setIsOpen: (value: boolean) => void;
}

export default function EditGameLocationForm({
  location,
  tenantId,
  domain,
  setIsOpen,
}: EditGameLocationFormProps) {
  const { data: tenant } = useTenantByDomain(domain);
  const updateTenant = useUpdateTenant(tenantId, domain);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: location.id,
      name: location.name,
      postcode: location.postcode,
      streetAddress: location.streetAddress,
      city: location.city,
      mapLink: location.mapLink,
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    try {
      const currentLocations = tenant.gameLocations ?? [];
      const updatedLocations = currentLocations.map((loc) =>
        loc.id === location.id ? { ...data } : loc
      );

      const updateData = {
        name: tenant.name,
        type: tenant.type,
        domain: tenant.domain,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        lateThresholdMinutes: tenant.lateThresholdMinutes,
        email: tenant.email ?? undefined,
        description: tenant.description ?? undefined,
        logo: tenant.logo ?? undefined,
        location: tenant.location ?? undefined,
        phoneNumber: tenant.phoneNumber ?? undefined,
        groupTypes: tenant.groupTypes ?? undefined,
        trainingLocations: tenant.trainingLocations ?? undefined,
        gameLocations: updatedLocations,
        isPublicSitePublished: tenant.isPublicSitePublished,
      };

      await updateTenant.mutateAsync(updateData);
      toast.success("Game location updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update game location");
    }
  };

  const onCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Name</FormLabel>
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
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Update"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

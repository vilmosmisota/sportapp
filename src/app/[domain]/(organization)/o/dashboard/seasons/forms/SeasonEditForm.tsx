"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateSeason } from "@/entities/season/Season.actions.client";
import { Season, SeasonForm } from "@/entities/season/Season.schema";
import { cn } from "@/libs/tailwind/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Calendar as CalendarDays,
  Clock,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input/DateInput";
import { parseISO } from "date-fns";
import MembershipFeeEditor from "./MembershipFeeEditor";
import BreaksEditor from "./BreaksEditor";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { CurrencyTypes } from "@/entities/common/Types";

type SeasonEditFormProps = {
  season: Season;
  tenantId: string;
  domain: string;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export function SeasonEditForm({
  season,
  tenantId,
  domain,
  setSheetOpen,
  setIsParentModalOpen,
}: SeasonEditFormProps) {
  const seasonMutation = useUpdateSeason(season.id.toString(), tenantId);
  const { data: tenant } = useTenantByDomain(domain);

  // Store initial values for comparison
  const [initialBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [initialMembershipFees] = useState(
    season.membershipPrices.map((mf) => ({
      ...mf,
      membershipCategory: { ...mf.membershipCategory },
    }))
  );

  const [breaks, setBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [membershipFees, setMembershipFees] = useState(
    season.membershipPrices.map((mf) => ({
      ...mf,
      membershipCategory: { ...mf.membershipCategory },
    }))
  );

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: season.startDate,
      endDate: season.endDate,
      breaks: season.breaks,
      isActive: season.isActive,
      customName: season.customName,
      membershipPrices: season.membershipPrices,
    },
  });

  // Function to check if breaks or membership fees have changed
  const isComponentsDirty = () => {
    const breaksChanged =
      JSON.stringify(breaks) !== JSON.stringify(initialBreaks);
    const feesChanged =
      JSON.stringify(membershipFees) !== JSON.stringify(initialMembershipFees);
    return breaksChanged || feesChanged;
  };

  const { handleSubmit } = form;
  const { isDirty: isFormDirty, isLoading } = form.formState;

  // Combine form dirty state with components dirty state
  const isDirty = isFormDirty || isComponentsDirty();

  const onSubmit = (data: SeasonForm) => {
    // Format the membership prices according to the schema
    const formattedMembershipPrices = membershipFees.map((fee) => ({
      membershipCategoryId: fee.membershipCategoryId,
      price: fee.price,
    }));

    // Format the breaks according to the schema
    const formattedBreaks = breaks.map((breakItem) => ({
      from: breakItem.from,
      to: breakItem.to,
    }));

    const formData: SeasonForm = {
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: formattedBreaks,
      membershipPrices: formattedMembershipPrices,
      customName: data.customName,
      isActive: data.isActive,
    };

    seasonMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Season updated");
        setSheetOpen(false);
        // Reset all form states
        form.reset();
        setBreaks(initialBreaks);
        setMembershipFees(initialMembershipFees);
      },
      onError: (error) => {
        toast.error("Failed to update season");
        console.error("Failed to update season:", error);
      },
    });
  };

  const onCancel = () => {
    setBreaks(initialBreaks);
    setMembershipFees(initialMembershipFees);
    form.reset();
    setIsParentModalOpen?.(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative h-[calc(100vh-8rem)] md:h-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1 space-y-6 overflow-y-auto px-4 md:px-0">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter custom name"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional name to identify this season
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          error={!!form.formState.errors.startDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          error={!!form.formState.errors.endDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Season</FormLabel>
                      <FormDescription>
                        Make this season active for your organization
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Membership Fees */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Membership Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MembershipFeeEditor
                tenantId={tenantId}
                initialMembershipFees={membershipFees}
                onUpdate={setMembershipFees}
                currency={tenant?.membershipCurrency || CurrencyTypes.GBP}
              />
            </CardContent>
          </Card>

          {/* Season Breaks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Season Breaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BreaksEditor
                breaks={breaks}
                onUpdate={setBreaks}
                minDate={form.getValues("startDate")}
                maxDate={form.getValues("endDate")}
              />
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky bottom-0 left-0 right-0 p-4 md:pt-3 border-t mt-auto">
          <FormButtons
            buttonText="Save"
            isLoading={isLoading}
            isDirty={isDirty}
            onCancel={onCancel}
            className="w-full md:w-auto"
          />
        </div>
      </form>
    </Form>
  );
}

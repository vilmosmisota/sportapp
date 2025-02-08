"use client";

import { Button } from "@/components/ui/button";
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
import { useAddSeason } from "@/entities/season/Season.actions.client";
import { SeasonForm } from "@/entities/season/Season.schema";
import { format } from "date-fns";
import { CalendarDays, Clock, Banknote } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input/DateInput";
import MembershipFeeEditor from "./MembershipFeeEditor";
import BreaksEditor from "./BreaksEditor";
import PhasesEditor from "./PhasesEditor";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";
import { CurrencyTypes } from "@/entities/common/Types";

type AddSeasonFormProps = {
  tenantId: string;
  domain: string;
  setIsParentModalOpen: (value: boolean) => void;
};

export function AddSeasonForm({
  tenantId,
  domain,
  setIsParentModalOpen,
}: AddSeasonFormProps) {
  const addSeason = useAddSeason(tenantId);
  const { data: tenant } = useTenantByDomain(domain);

  const [breaks, setBreaks] = useState<{ id: number; from: Date; to: Date }[]>(
    []
  );
  const [membershipFees, setMembershipFees] = useState<any[]>([]);
  const [phases, setPhases] = useState<string[]>([]);

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      breaks: [],
      isActive: false,
      customName: "",
      membershipPrices: [],
      phases: null,
    },
  });

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

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
      phases: phases.length > 0 ? phases : null,
    };

    addSeason.mutate(formData, {
      onSuccess: () => {
        toast.success("Season added");
        setIsParentModalOpen(false);
        form.reset();
        setBreaks([]);
        setMembershipFees([]);
        setPhases([]);
      },
      onError: (error) => {
        toast.error("Failed to add season");
        console.error("Failed to add season:", error);
      },
    });
  };

  const onCancel = () => {
    form.reset();
    setBreaks([]);
    setMembershipFees([]);
    setPhases([]);
    setIsParentModalOpen(false);
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

          {/* Season Phases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Season Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhasesEditor phases={phases} onUpdate={setPhases} />
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky bottom-0 left-0 right-0 p-4 md:pt-3 border-t mt-auto">
          <FormButtons
            buttonText="Add"
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

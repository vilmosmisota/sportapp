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
import { CalendarIcon, Calendar as CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input/DateInput";
import { parseISO } from "date-fns";
import BreaksEditor from "./BreaksEditor";
import PhasesEditor from "./PhasesEditor";
import { useTenantByDomain } from "@/entities/tenant/Tenant.query";

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

  const [initialPhases] = useState(season.phases);
  const [phases, setPhases] = useState(season.phases);

  const [breaks, setBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: season.startDate,
      endDate: season.endDate,
      breaks: season.breaks,
      isActive: season.isActive,
      customName: season.customName,
      phases: season.phases,
    },
  });

  // Function to check if breaks or phases have changed
  const isComponentsDirty = () => {
    const breaksChanged =
      JSON.stringify(breaks) !== JSON.stringify(initialBreaks);
    const phasesChanged =
      JSON.stringify(phases) !== JSON.stringify(initialPhases);
    return breaksChanged || phasesChanged;
  };

  const { handleSubmit } = form;
  const { isDirty: isFormDirty, isLoading } = form.formState;

  // Combine form dirty state with components dirty state
  const isDirty = isFormDirty || isComponentsDirty();

  const onSubmit = (data: SeasonForm) => {
    // Format the breaks according to the schema
    const formattedBreaks = breaks.map((breakItem) => ({
      from: breakItem.from,
      to: breakItem.to,
    }));

    const formData: SeasonForm = {
      startDate: data.startDate,
      endDate: data.endDate,
      breaks: formattedBreaks,
      customName: data.customName,
      isActive: data.isActive,
      phases: phases,
    };

    seasonMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Season updated");
        setSheetOpen(false);
        // Reset all form states
        form.reset();
        setBreaks(initialBreaks);
        setPhases(initialPhases);
      },
      onError: (error) => {
        toast.error("Failed to update season");
        console.error("Failed to update season:", error);
      },
    });
  };

  const onCancel = () => {
    setBreaks(initialBreaks);
    setPhases(initialPhases);
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
                <Clock className="h-4 w-4" />
                Season Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhasesEditor phases={phases} onUpdate={setPhases} />
            </CardContent>
          </Card>
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

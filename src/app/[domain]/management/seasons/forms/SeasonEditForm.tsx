"use client";

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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "@/components/ui/date-range";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateSeason } from "@/entities/season/Season.actions.client";
import { Season, SeasonForm } from "@/entities/season/Season.schema";
import { addDays } from "date-fns";
import { Calendar as CalendarDays, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import BreaksEditor from "./BreaksEditor";

type SeasonEditFormProps = {
  season: Season;
  tenantId: string;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen?: (value: boolean) => void;
};

export function SeasonEditForm({
  season,
  tenantId,
  setSheetOpen,
  setIsParentModalOpen,
}: SeasonEditFormProps) {
  const seasonMutation = useUpdateSeason(season.id.toString(), tenantId);

  // Store initial values for comparison
  const [initialBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [breaks, setBreaks] = useState(
    season.breaks.map((br, index) => ({
      id: index + 1,
      from: br.from,
      to: br.to,
    }))
  );

  const [minBreakDate, setMinBreakDate] = useState<Date>(season.startDate);
  const [maxBreakDate, setMaxBreakDate] = useState<Date>(season.endDate);

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: season.startDate,
      endDate: season.endDate,
      breaks: season.breaks,
      isActive: season.isActive,
      customName: season.customName,
    },
  });

  // Update break date boundaries when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "startDate" || name === "endDate") {
        const startDate = value.startDate as Date;
        const endDate = value.endDate as Date;

        if (startDate) setMinBreakDate(startDate);
        if (endDate) setMaxBreakDate(endDate);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Function to check if breaks or phases have changed
  const isComponentsDirty = () => {
    const breaksChanged =
      JSON.stringify(breaks) !== JSON.stringify(initialBreaks);
    return breaksChanged;
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
    };

    seasonMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Season updated");
        setSheetOpen(false);
        // Reset all form states
        form.reset();
        setBreaks(initialBreaks);
      },
      onError: (error) => {
        toast.error("Failed to update season");
        console.error("Failed to update season:", error);
      },
    });
  };

  const onCancel = () => {
    setBreaks(initialBreaks);

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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field: startDateField }) => (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field: endDateField }) => (
                      <FormItem>
                        <FormLabel>Season Dates</FormLabel>
                        <FormControl>
                          <DateRange
                            startDate={startDateField.value}
                            endDate={endDateField.value}
                            onStartDateChange={(date) => {
                              if (date) {
                                startDateField.onChange(date);
                                // Update end date to be one day after start date
                                const newEndDate = addDays(new Date(date), 1);
                                endDateField.onChange(newEndDate);
                              }
                            }}
                            onEndDateChange={(date) => {
                              if (date) endDateField.onChange(date);
                            }}
                            showDuration={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              />

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
                minDate={minBreakDate}
                maxDate={maxBreakDate}
              />
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

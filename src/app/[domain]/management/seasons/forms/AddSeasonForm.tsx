"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "@/components/ui/date-range";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAddSeason } from "@/entities/season/Season.actions.client";
import { SeasonForm } from "@/entities/season/Season.schema";
import { addDays } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import BreaksEditor from "./BreaksEditor";

type Break = { id: number; from: Date; to: Date };
type AddSeasonFormProps = {
  tenantId: string;
  setIsParentModalOpen: (value: boolean) => void;
};

export function AddSeasonForm({
  tenantId,
  setIsParentModalOpen,
}: AddSeasonFormProps) {
  const addSeason = useAddSeason(tenantId);

  const [breaks, setBreaks] = useState<Break[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Store these as simple states instead of derived states
  const [minBreakDate, setMinBreakDate] = useState<Date>(today);
  const [maxBreakDate, setMaxBreakDate] = useState<Date>(tomorrow);

  const form = useForm<SeasonForm>({
    defaultValues: {
      startDate: today,
      endDate: tomorrow,
      breaks: [],
      isActive: false,
      customName: "",
    },
  });

  // Memoize this handler to prevent unnecessary re-renders
  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      // Create a new date object to avoid mutation issues
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);

      form.setValue("startDate", newDate, { shouldDirty: true });
      setMinBreakDate(newDate);

      // Only update end date if necessary
      const currentEndDate = form.getValues("endDate");
      if (newDate >= currentEndDate) {
        const newEndDate = addDays(new Date(newDate), 1);
        form.setValue("endDate", newEndDate, { shouldDirty: true });
        setMaxBreakDate(newEndDate);
      }
    },
    [form]
  );

  // Memoize this handler to prevent unnecessary re-renders
  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      // Create a new date object to avoid mutation issues
      const newDate = new Date(date);
      newDate.setHours(23, 59, 59, 999);

      form.setValue("endDate", newDate, { shouldDirty: true });
      setMaxBreakDate(newDate);
    },
    [form]
  );

  const { handleSubmit } = form;
  const { isDirty, isLoading } = form.formState;

  // Use state values instead of form.getValues() which doesn't trigger re-renders
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

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

    addSeason.mutate(formData, {
      onSuccess: () => {
        toast.success("Season added");
        setIsParentModalOpen(false);
        form.reset();
        setBreaks([]);
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

              {/* We've moved to direct form handlers rather than nested form fields */}
              <FormItem>
                <FormLabel>Season Dates</FormLabel>
                <FormControl>
                  <DateRange
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                    showDuration={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

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

        <FormButtons
          buttonText="Save"
          isLoading={isLoading}
          isDirty={isDirty}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDisplayGender,
  getDisplayAgeGroup,
  Team,
} from "@/entities/team/Team.schema";
import { Season } from "@/entities/season/Season.schema";
import { TrainingForm } from "@/entities/training/Training.schema";
import { useAddTrainingBatch } from "@/entities/training/Training.actions.client";
import { TrainingLocation } from "@/entities/tenant/Tenant.schema";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { TeamSelector } from "@/components/ui/team-selector";

const daysOfWeek = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];

const formSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  locationId: z.string().min(1, "Location is required"),
  teamId: z.string().min(1, "Team is required"),
  selectedDays: z.array(z.number()).min(1, "Select at least one day"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  tenantId: string;
  domain: string;
  selectedSeason: Season | null;
  teams: Team[];
  setIsOpen: (open: boolean) => void;
}

export default function CreateTrainingScheduleForm({
  tenantId,
  domain,
  selectedSeason,
  teams,
  setIsOpen,
}: Props) {
  const locations = useTrainingLocations(domain);
  const addTrainingBatch = useAddTrainingBatch(tenantId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      locationId: "",
      teamId: "",
      selectedDays: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!selectedSeason) {
      toast.error("Please select a season first");
      return;
    }

    try {
      setIsSubmitting(true);

      const location = locations.find((l) => l.id === values.locationId);
      if (!location) return;

      const startDate = new Date(selectedSeason.startDate);
      const endDate = new Date(selectedSeason.endDate);

      // Generate all dates between start and end date that match the selected days
      const dates: string[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (values.selectedDays.includes(currentDate.getDay())) {
          // Check if the date falls within any break period
          const isBreak = selectedSeason.breaks.some((breakPeriod) =>
            isWithinInterval(currentDate, {
              start: new Date(breakPeriod.from),
              end: new Date(breakPeriod.to),
            })
          );

          // Only add the date if it's not during a break
          if (!isBreak) {
            dates.push(currentDate.toISOString());
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (dates.length === 0) {
        toast.error(
          "No valid training dates found after excluding break periods"
        );
        return;
      }

      // Create trainings in batch
      await addTrainingBatch.mutateAsync({
        dates,
        startTime: values.startTime,
        endTime: values.endTime,
        location,
        teamId: parseInt(values.teamId),
        seasonId: selectedSeason.id,
      });

      toast.success("Training schedule created successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create training schedule");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Season Info */}
          {selectedSeason && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Selected Season
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {selectedSeason.customName ??
                    `${format(
                      selectedSeason.startDate,
                      "dd/MM/yyyy"
                    )} - ${format(selectedSeason.endDate, "dd/MM/yyyy")}`}
                  {selectedSeason.isActive && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Days Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="selectedDays"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Days</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Toggle
                          key={day.id}
                          pressed={form.watch("selectedDays").includes(day.id)}
                          onPressedChange={(pressed) => {
                            const current = form.watch("selectedDays");
                            if (pressed) {
                              form.setValue("selectedDays", [
                                ...current,
                                day.id,
                              ]);
                            } else {
                              form.setValue(
                                "selectedDays",
                                current.filter((d) => d !== day.id)
                              );
                            }
                          }}
                          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        >
                          {day.name}
                        </Toggle>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location, index) => (
                          <SelectItem
                            key={location.id || `loc-${index}`}
                            value={location.id || `loc-${index}`}
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Team Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeamSelector
                teams={teams}
                control={form.control}
                name="teamId"
                placeholder="Select team"
              />
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Create Schedule"
            isLoading={isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}

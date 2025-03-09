"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FormButtons from "@/components/ui/form-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Calendar, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { GroupedTraining, Training } from "@/entities/training/Training.schema";
import { useTrainingLocations } from "@/entities/tenant/hooks/useTrainingLocations";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useUpdateTraining,
  useDeleteTraining,
} from "@/entities/training/Training.actions.client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { formatTeamName } from "../utils";

interface Props {
  training: GroupedTraining;
  setIsOpen: (open: boolean) => void;
  domain: string;
  tenantId: string;
  seasonId: number;
}

interface TrainingItem extends Training {
  isEditing: boolean;
}

// Define a schema for the training form
const trainingFormSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  locationId: z.string(),
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

export default function EditTrainingPatternItemsForm({
  training,
  setIsOpen,
  domain,
  tenantId,
  seasonId,
}: Props) {
  const locations = useTrainingLocations(domain);
  const client = useSupabase();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTrainingMutation = useUpdateTraining(
    selectedTraining?.id || 0,
    tenantId
  );
  const deleteTrainingMutation = useDeleteTraining(tenantId);

  // Create a form instance
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
      locationId: "",
    },
  });

  // Fetch all individual trainings in this pattern
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);

        // Query trainings that match the pattern criteria
        const { data, error } = await client
          .from("trainings")
          .select(
            `
            *,
            team:teams (
              id,
              age,
              gender,
              skill,
              appearance
            ),
            trainingSeasonConnections:trainingSeasonConnections (
              *,
              season:seasons (
                id,
                startDate,
                endDate,
                breaks
              )
            )
          `
          )
          .eq("tenantId", tenantId)
          .eq("startTime", training.startTime)
          .eq("endTime", training.endTime)
          .eq("teamId", training.teamId)
          .gte("date", training.firstDate)
          .lte("date", training.lastDate)
          .order("date", { ascending: true });

        if (error) throw error;

        // Transform data to include editing state
        const transformedData = data.map((item) => ({
          ...item,
          date: new Date(item.date),
          isEditing: false,
        }));

        setTrainings(transformedData);
      } catch (error) {
        console.error("Error fetching trainings:", error);
        toast.error("Failed to load trainings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainings();
  }, [client, tenantId, training]);

  const handleEditClick = (trainingItem: TrainingItem) => {
    // Instead of deep copying the entire object, just create a new object with the editable properties
    const editableTraining = {
      ...trainingItem,
      date:
        trainingItem.date instanceof Date
          ? new Date(trainingItem.date)
          : new Date(trainingItem.date),
    };

    // Set all trainings to not editing except the selected one
    setTrainings(
      trainings.map((t) => ({
        ...t,
        isEditing: t.id === trainingItem.id,
      }))
    );

    // Set the selected training
    setSelectedTraining(editableTraining);

    // Set form values
    form.reset({
      date: editableTraining.date,
      startTime: editableTraining.startTime,
      endTime: editableTraining.endTime,
      locationId: editableTraining.location?.id || "",
    });

    // Reset form dirty state
    setIsFormDirty(false);
  };

  const handleDeleteClick = (trainingItem: TrainingItem) => {
    setSelectedTraining(trainingItem);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: TrainingFormValues) => {
    try {
      setIsSubmitting(true);
      if (!selectedTraining) return;

      const location = locations.find((l) => l.id === data.locationId);
      if (!location) {
        toast.error("Selected location not found");
        return;
      }

      // Find the original training item to get the complete data
      const originalTraining = trainings.find(
        (t) => t.id === selectedTraining.id
      );
      if (!originalTraining) {
        toast.error("Training not found");
        return;
      }

      // Update directly in the database to bypass Zod validation
      const { error } = await client
        .from("trainings")
        .update({
          date: data.date.toISOString().split("T")[0],
          startTime: data.startTime,
          endTime: data.endTime,
          location: location,
        })
        .eq("id", selectedTraining.id)
        .eq("tenantId", tenantId);

      if (error) {
        console.error("Error updating training:", error);
        toast.error("Failed to update training");
        return;
      }

      // Manually invalidate all relevant cache keys
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.training.grouped] });
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.training.detail(tenantId, selectedTraining.id.toString()),
        ],
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.team.all] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.season.all] });

      // Update the training in the local state
      setTrainings(
        trainings.map((item) =>
          item.id === selectedTraining.id
            ? {
                ...item, // Start with the original training to preserve all nested objects
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                location: location,
                isEditing: false,
              }
            : item
        )
      );

      setSelectedTraining(null);
      form.reset();
      setIsFormDirty(false);
      toast.success("Training updated successfully");
    } catch (error: any) {
      console.error("Error updating training:", error);
      toast.error("Failed to update training");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset editing state for all trainings
    setTrainings(
      trainings.map((t) => ({
        ...t,
        isEditing: false,
      }))
    );

    // Clear the selected training
    setSelectedTraining(null);
    setIsFormDirty(false);
    form.reset();
  };

  const handleDeleteTraining = async () => {
    try {
      if (!selectedTraining) return;

      await deleteTrainingMutation.mutateAsync(selectedTraining.id);

      // Remove the training from the local state
      setTrainings(trainings.filter((t) => t.id !== selectedTraining.id));

      setSelectedTraining(null);
      setIsDeleteDialogOpen(false);
      toast.success("Training deleted successfully");
    } catch (error) {
      console.error("Error deleting training:", error);
      toast.error("Failed to delete training");
    }
  };

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, "h:mm a");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading trainings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pattern Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Training Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatTime(training.startTime)} -{" "}
                {formatTime(training.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {training.location.name}, {training.location.city}
              </span>
            </div>
            {training.teamName && (
              <div className="text-sm">
                Team: {formatTeamName(training.teamName)}
              </div>
            )}
            <div className="text-sm">
              Total sessions: {training.trainingCount}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainings List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Training Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No training sessions found in this pattern.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainings.map((trainingItem) => (
                    <TableRow key={trainingItem.id}>
                      {trainingItem.isEditing ? (
                        <>
                          <TableCell colSpan={4}>
                            <Form {...form}>
                              <form
                                className="space-y-4"
                                onChange={() => setIsFormDirty(true)}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="date"
                                            value={
                                              field.value instanceof Date
                                                ? field.value
                                                    .toISOString()
                                                    .split("T")[0]
                                                : ""
                                            }
                                            onChange={(e) => {
                                              field.onChange(
                                                new Date(e.target.value)
                                              );
                                              setIsFormDirty(true);
                                            }}
                                            className="w-full"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="time"
                                            {...field}
                                            onChange={(e) => {
                                              field.onChange(e.target.value);
                                              setIsFormDirty(true);
                                            }}
                                            className="w-full"
                                          />
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
                                          <Input
                                            type="time"
                                            {...field}
                                            onChange={(e) => {
                                              field.onChange(e.target.value);
                                              setIsFormDirty(true);
                                            }}
                                            className="w-full"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name="locationId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Location</FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            setIsFormDirty(true);
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select location" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {locations.map(
                                              (location, locationIndex) => (
                                                <SelectItem
                                                  key={
                                                    location.id ||
                                                    `loc-${locationIndex}`
                                                  }
                                                  value={
                                                    location.id ||
                                                    `loc-${locationIndex}`
                                                  }
                                                >
                                                  {location.name}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="flex justify-end gap-2 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="default"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={!isFormDirty || isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                      </div>
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            {format(
                              trainingItem.date instanceof Date
                                ? trainingItem.date
                                : new Date(trainingItem.date),
                              "EEEE, MMMM d, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatTime(trainingItem.startTime)} -{" "}
                            {formatTime(trainingItem.endTime)}
                          </TableCell>
                          <TableCell>
                            {trainingItem.location?.name},{" "}
                            {trainingItem.location?.city}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(trainingItem)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(trainingItem)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          className="mr-2"
        >
          Close
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Training Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this training session? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTraining && (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Date:</strong>{" "}
                  {format(
                    selectedTraining.date instanceof Date
                      ? selectedTraining.date
                      : new Date(selectedTraining.date),
                    "EEEE, MMMM d, yyyy"
                  )}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime(selectedTraining.startTime)} -{" "}
                  {formatTime(selectedTraining.endTime)}
                </p>
                <p>
                  <strong>Location:</strong> {selectedTraining.location?.name},{" "}
                  {selectedTraining.location?.city}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTraining}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

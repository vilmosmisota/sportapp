"use client";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormButtons from "@/components/ui/form-buttons";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import {
  CompetitionType,
  CompetitionTypeSchema,
  Tenant,
} from "@/entities/tenant/Tenant.schema";
import { ColorPicker } from "@/components/ui/color-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Trophy, Trash2 } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string().optional(),
  originalName: z.string(), // To track the original name for finding the item to update
});

type FormValues = z.infer<typeof formSchema>;

interface EditCompetitionTypeFormProps {
  tenant?: Tenant;
  competitionType: CompetitionType;
  setIsOpen: (value: boolean) => void;
}

// Default color from design system - for visual preview only, not assigned by default
const DEFAULT_COLOR = "#7c3aed"; // Vivid purple

export default function EditCompetitionTypeForm({
  tenant,
  competitionType,
  setIsOpen,
}: EditCompetitionTypeFormProps) {
  const tenantUpdate = useUpdateTenant(
    tenant?.id?.toString() ?? "",
    tenant?.domain ?? ""
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: competitionType.name,
      color: competitionType.color || undefined, // Maintain existing color or undefined
      originalName: competitionType.name,
    },
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting, isDirty } = formState;

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    try {
      // Get existing competition types or initialize as empty array
      const existingTypes = tenant.competitionTypes || [];

      // Check for duplicates if name changed and new name exists
      if (data.name !== data.originalName) {
        const isDuplicate = existingTypes.some(
          (type) => type.name === data.name
        );
        if (isDuplicate) {
          toast.error(`Competition type "${data.name}" already exists`);
          return;
        }
      }

      // Create updated array with edited competition type
      const competitionTypes = existingTypes.map((type) => {
        if (type.name === data.originalName) {
          return {
            name: data.name,
            color: data.color,
          };
        }
        return type;
      });

      // Update tenant with proper TenantForm object
      await tenantUpdate.mutateAsync({
        name: tenant.name,
        domain: tenant.domain,
        type: tenant.type,
        email: tenant.email || undefined,
        description: tenant.description || undefined,
        logo: tenant.logo || undefined,
        location: tenant.location || undefined,
        phoneNumber: tenant.phoneNumber || undefined,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        groupTypes: tenant.groupTypes || undefined,
        trainingLocations: tenant.trainingLocations || undefined,
        gameLocations: tenant.gameLocations || undefined,
        lateThresholdMinutes: tenant.lateThresholdMinutes,
        isPublicSitePublished: tenant.isPublicSitePublished,
        competitionTypes,
      });

      toast.success("Competition type updated");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update competition type");
      console.error("Error updating competition type:", error);
    }
  };

  const handleDelete = async () => {
    if (!tenant) return;

    try {
      // Get existing competition types
      const existingTypes = tenant.competitionTypes || [];

      // Filter out the current competition type
      const competitionTypes = existingTypes.filter(
        (type) => type.name !== competitionType.name
      );

      // Update tenant with proper TenantForm object
      await tenantUpdate.mutateAsync({
        name: tenant.name,
        domain: tenant.domain,
        type: tenant.type,
        email: tenant.email || undefined,
        description: tenant.description || undefined,
        logo: tenant.logo || undefined,
        location: tenant.location || undefined,
        phoneNumber: tenant.phoneNumber || undefined,
        sport: tenant.sport,
        membershipCurrency: tenant.membershipCurrency,
        groupTypes: tenant.groupTypes || undefined,
        trainingLocations: tenant.trainingLocations || undefined,
        gameLocations: tenant.gameLocations || undefined,
        lateThresholdMinutes: tenant.lateThresholdMinutes,
        isPublicSitePublished: tenant.isPublicSitePublished,
        competitionTypes,
      });

      toast.success(`Competition type "${competitionType.name}" deleted`);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to delete competition type");
      console.error("Error deleting competition type:", error);
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
        <div className="space-y-6">
          {/* Competition Type Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Competition Details
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 p-2 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the competition type &quot;
                        {competitionType.name}&quot;. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Name</FormLabel>
                    <FormDescription>
                      Enter a name for this competition type (e.g., League,
                      Tournament, Cup)
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormDescription>
                      Choose a color to identify this competition type in the
                      system (optional)
                    </FormDescription>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        {field.value ? (
                          <>
                            <div
                              className="h-6 w-6 rounded-full border shadow-sm"
                              style={{ backgroundColor: field.value }}
                            />
                            <p className="text-sm text-muted-foreground">
                              {field.value}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No color selected
                          </p>
                        )}
                      </div>
                      <FormControl>
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                          className={cn(
                            "hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          )}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Save Changes"
            isLoading={isSubmitting}
            isDirty={isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Users, Award, Layers } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateTenant } from "@/entities/tenant/Tenant.actions.client";
import { toast } from "sonner";
import { X } from "lucide-react";
import FormButtons from "@/components/ui/form-buttons";

interface PlayerManagementContentProps {
  tenant: Tenant | undefined;
}

export default function PlayerManagementContent({
  tenant,
}: PlayerManagementContentProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Get player positions from tenant
  const positions = tenant?.playerSettings?.positions || [];

  return (
    <div className="space-y-8">
      {/* Section Introduction */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Player Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure player settings for your organization
        </p>
      </div>

      {/* Player Positions Card */}
      <Card className="border">
        <CardHeader className="bg-secondary/30 py-2 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Layers className="h-4 w-4" />
            Player Positions
          </CardTitle>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Manage Positions
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Manage your organization&apos;s player positions
              </h3>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                {positions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No positions defined - Click &quot;Manage Positions&quot; to
                    add some
                  </p>
                ) : (
                  positions.map((position) => (
                    <Badge
                      key={position}
                      variant="secondary"
                      className="capitalize"
                    >
                      {position}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveSheet
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="Manage Player Positions"
      >
        <ManagePlayerPositionsForm
          tenant={tenant}
          setIsParentModalOpen={setIsAddOpen}
        />
      </ResponsiveSheet>
    </div>
  );
}

// Form for managing player positions
interface ManagePlayerPositionsFormProps {
  tenant: Tenant | undefined;
  setIsParentModalOpen: (value: boolean) => void;
}

const formSchema = z.object({
  positions: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

function ManagePlayerPositionsForm({
  tenant,
  setIsParentModalOpen,
}: ManagePlayerPositionsFormProps) {
  const updateTenant = useUpdateTenant(
    tenant?.id.toString() ?? "",
    tenant?.domain ?? ""
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positions: tenant?.playerSettings?.positions || [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    const playerSettings = {
      positions: data.positions
        .filter(Boolean)
        .map((value) => value.trim())
        .map(
          (value) =>
            value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        ),
    };

    const updateData = {
      name: tenant.name,
      type: tenant.type,
      domain: tenant.domain,
      sport: tenant.sport,
      membershipCurrency: tenant.membershipCurrency,
      lateThresholdMinutes: tenant.lateThresholdMinutes,
      groupTypes: tenant.groupTypes ?? undefined,
      isPublicSitePublished: tenant.isPublicSitePublished,
      playerSettings,
    };

    updateTenant.mutate(updateData, {
      onSuccess: () => {
        toast.success("Player positions updated successfully");
        setIsParentModalOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  const addPosition = () => {
    const currentPositions = form.getValues("positions");
    form.setValue("positions", [...currentPositions, ""]);
  };

  const handleRemovePosition = (index: number) => {
    const currentPositions = form.getValues("positions");

    const newPositions = currentPositions.filter((_, i) => i !== index);

    form.setValue("positions", newPositions, {
      shouldDirty: true,
    });
  };

  const { isDirty, isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-base font-semibold">Player Positions</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Define positions for players in your organization
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPosition}
                className="h-9 px-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Position
              </Button>
            </div>
            <div className="space-y-4">
              {form.watch("positions").length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20 space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    No positions defined yet. Click the &quot;Add Position&quot;
                    button to create positions.
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={addPosition}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Position
                  </Button>
                </div>
              ) : (
                form.watch("positions").map((position, index) => (
                  <div
                    key={index}
                    className="relative flex gap-4 items-start p-4 rounded-lg border bg-card"
                  >
                    <FormField
                      control={form.control}
                      name={`positions.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              className="h-9"
                              placeholder="e.g. Forward, Goalkeeper, Midfielder"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePosition(index)}
                      className="h-9 w-9 absolute -top-2 -right-2 bg-background shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t mt-6">
          <FormButtons
            buttonText="Save Positions"
            isLoading={isSubmitting}
            isDirty={isDirty}
            onCancel={() => setIsParentModalOpen(false)}
          />
        </div>
      </form>
    </Form>
  );
}

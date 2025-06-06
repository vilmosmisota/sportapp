import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateOpponent } from "@/entities/opponent/Opponent.actions";
import {
  Opponent,
  OpponentFormSchema,
  type OpponentForm as OpponentFormType,
} from "@/entities/opponent/Opponent.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Users,
  PlusCircle,
  MapPin,
  Mail,
  Phone,
  StickyNote,
  Palette,
  Info,
  Trash2,
} from "lucide-react";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  getDisplayAgeGroup,
  getDisplayGender,
  TeamGender,
  isTenantTeam,
  Team,
} from "@/entities/group/Group.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useGetTeamsByTenantId } from "@/entities/group/Group.query";
import { useMemo } from "react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";

interface CreateOpponentFormProps {
  tenantId: string;
  setIsOpen: (value: boolean) => void;
  tenant: Tenant;
}

interface TeamTableProps {
  teams: Team[];
  selectedTeamIds: number[];
  onToggleTeam: (teamId: number) => void;
}

const TeamTable = ({
  teams,
  selectedTeamIds,
  onToggleTeam,
}: TeamTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Age Group</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Skill Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell>
              <Checkbox
                checked={selectedTeamIds.includes(team.id)}
                onCheckedChange={() => onToggleTeam(team.id)}
              />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium">
                {getDisplayAgeGroup(team.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {getDisplayGender(team.gender, team.age)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {team.skill}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {teams.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No teams available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// Helper function to map team to basic data
const mapTeamToBasicData = (team: Team) => ({
  id: team.id,
  age: team.age,
  gender: team.gender,
  skill: team.skill,
});

export default function CreateOpponentForm({
  tenantId,
  setIsOpen,
  tenant,
}: CreateOpponentFormProps) {
  const [formKey, setFormKey] = useState(0);
  const [forceReset, setForceReset] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const createOpponent = useCreateOpponent(tenantId);
  const { data: allTeams } = useGetTeamsByTenantId(tenantId);

  // Filter and prepare teams for selection
  const selectableTeams = useMemo(() => {
    if (!allTeams) return [];

    // Teams returned by useGetTeamsByTenantId are already filtered
    // to include only tenant teams (opponentId is null)
    return allTeams;
  }, [allTeams]);

  const form = useForm<OpponentFormType>({
    resolver: zodResolver(OpponentFormSchema, {
      // Be more lenient with undefined values
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_type" && issue.received === "undefined") {
          return { message: "" };
        }
        return { message: ctx.defaultError };
      },
    }),
    defaultValues: {
      name: "",
      location: {
        name: "",
        streetAddress: "",
        city: "",
        postcode: "",
        mapLink: "",
      },
      tenantId: Number(tenantId),
      teamIds: null,
      teams: null,
      appearance: null,
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  });

  const { handleSubmit, watch } = form;
  const { isDirty, isLoading } = form.formState;
  const selectedTeamIds = watch("teamIds") ?? [];

  const resetFormCompletely = () => {
    form.setValue("name", "");
    form.setValue("location", null);
    form.setValue("teamIds", null);
    form.setValue("teams", null);
    form.setValue("appearance", null);
    form.setValue("contactEmail", "");
    form.setValue("contactPhone", "");
    form.setValue("notes", "");
    form.setValue("tenantId", Number(tenantId));
    form.reset();
    setFormKey((prev) => prev + 1);
    setForceReset(true);
  };

  useEffect(() => {
    if (forceReset) {
      form.reset();
      setForceReset(false);
    }
  }, [forceReset, form]);

  // Prepare form data with validation
  const prepareFormData = (formData: OpponentFormType) => {
    // Ensure appearance object exists with empty color if not set
    if (!formData.appearance) {
      formData.appearance = {
        color: "",
      };
    }

    // If appearance exists but color is undefined, set it to empty string
    if (formData.appearance && formData.appearance.color === undefined) {
      formData.appearance.color = "";
    }

    // Ensure location object exists with empty values if not set
    if (!formData.location) {
      formData.location = {
        name: "",
        streetAddress: "",
        city: "",
        postcode: "",
        mapLink: "",
      };
    }

    // Ensure all location fields are at least empty strings, not null
    if (formData.location) {
      formData.location.name = formData.location.name || "";
      formData.location.streetAddress = formData.location.streetAddress || "";
      formData.location.city = formData.location.city || "";
      formData.location.postcode = formData.location.postcode || "";
      formData.location.mapLink = formData.location.mapLink || "";
    }

    // Handle empty email - ensure it's an empty string, not null
    if (formData.contactEmail === null) {
      formData.contactEmail = "";
    }

    // Handle phone and notes - ensure they're empty strings, not null
    if (formData.contactPhone === null) {
      formData.contactPhone = "";
    }

    if (formData.notes === null) {
      formData.notes = "";
    }

    // Ensure teamIds are preserved (not null or undefined)
    if (formData.teamIds === null || formData.teamIds === undefined) {
      formData.teamIds = [];
    }

    return formData;
  };

  const onSubmit = async (data: OpponentFormType) => {
    try {
      // Process basic form data
      const processedData = prepareFormData(data);

      // Handle team data conversion
      const teamIdsToInclude = processedData.teamIds || [];

      // For new opponents, just map the selected team IDs to team data
      const finalTeamData = selectableTeams
        .filter((team: Team) => teamIdsToInclude.includes(team.id))
        .map(mapTeamToBasicData);

      // Final data for submission
      const submitData = {
        ...processedData,
        teams: finalTeamData,
      };

      await createOpponent.mutateAsync(submitData);
      toast.success("Opponent added successfully");
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Validation errors:", form.formState.errors);
      toast.error(error.message || "Failed to submit form");
    }
  };

  const onSubmitAndAddAnother = async (data: OpponentFormType) => {
    try {
      // Process basic form data
      const processedData = prepareFormData(data);

      // Handle team data conversion
      const teamIdsToInclude = processedData.teamIds || [];

      // For new opponents, just map the selected team IDs to team data
      const finalTeamData = selectableTeams
        .filter((team: Team) => teamIdsToInclude.includes(team.id))
        .map(mapTeamToBasicData);

      // Final data for submission
      const submitData = {
        ...processedData,
        teams: finalTeamData,
      };

      await createOpponent.mutateAsync(submitData);
      toast.success("Opponent added successfully");
      resetFormCompletely();
    } catch (error: any) {
      console.error("Error adding opponent:", error);
      toast.error(error.message || "Failed to add opponent");
    }
  };

  const onCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const handleColorChange = (color: string | undefined) => {
    // Save the current teamIds to ensure we don't lose them
    const currentTeamIds = form.getValues("teamIds");

    // Only set the color without any other fields
    form.setValue(
      "appearance",
      {
        color: color || "",
      },
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );

    // Ensure teamIds are preserved after color change
    if (currentTeamIds) {
      form.setValue("teamIds", currentTeamIds, { shouldDirty: false });
    }
  };

  const toggleTeam = (teamId: number) => {
    // Get current selected team IDs
    const currentTeamIds = form.getValues("teamIds") ?? [];
    // Check if this team is already selected
    const isSelected = currentTeamIds.includes(teamId);

    if (isSelected) {
      // Remove the team from selection
      form.setValue(
        "teamIds",
        currentTeamIds.filter((id) => id !== teamId),
        { shouldDirty: true }
      );
    } else {
      // Add the team to selection
      form.setValue("teamIds", [...currentTeamIds, teamId], {
        shouldDirty: true,
      });
    }
  };

  // Handle email field changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Set empty emails as empty strings, not null
    form.setValue("contactEmail", value, { shouldValidate: true });
  };

  // Handle location field changes
  const handleLocationFieldChange = (
    field: "name" | "streetAddress" | "city" | "postcode" | "mapLink",
    value: string
  ) => {
    // Initialize location if it doesn't exist
    if (!form.getValues("location")) {
      form.setValue(
        "location",
        {
          name: "",
          streetAddress: "",
          city: "",
          postcode: "",
          mapLink: "",
        },
        { shouldDirty: true, shouldValidate: true }
      );
    }

    // Update the specific field
    form.setValue(`location.${field}` as any, value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <Form {...form}>
      <form
        key={formKey}
        className="flex flex-col gap-6 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Tabs
          defaultValue="basic"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">
                  Basic Information
                </h4>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      Name <span className="text-destructive font-bold">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter opponent name"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 font-medium">
                        <Mail className="h-3.5 w-3.5" />
                        Contact Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contact@example.com"
                          type="email"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            handleEmailChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 font-medium">
                        <Phone className="h-3.5 w-3.5" />
                        Contact Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter phone number"
                          type="tel"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      <StickyNote className="h-3.5 w-3.5" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about this opponent"
                        {...field}
                        value={field.value || ""}
                        className={cn(
                          "min-h-[100px] border-2",
                          field.value ? "border-green-200" : "border-slate-100"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appearance.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      <Palette className="h-3.5 w-3.5" />
                      Opponent Color
                    </FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value || ""}
                        onChange={handleColorChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <div className="space-y-4">
              {/* Description of what this tab is for */}
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-1 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-primary" />
                  Team Structure
                </h4>
                <p className="text-sm text-muted-foreground">
                  In competitions, your teams typically face opponents with
                  similar age groups, genders, and skill levels. This tab lets
                  you mirror your organization&apos;s team structure for this
                  opponent, making it easier to schedule matches between
                  comparable teams.
                </p>
              </div>

              {/* Available teams to select */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Create Matching Teams
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select your teams below to automatically create
                    corresponding team structures for this opponent. This helps
                    maintain parity when scheduling matches.
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border">
                    {selectableTeams && (
                      <TeamTable
                        teams={selectableTeams}
                        selectedTeamIds={selectedTeamIds}
                        onToggleTeam={toggleTeam}
                      />
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">
                  Location Information
                </h4>
              </div>

              <FormField
                control={form.control}
                name="location.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      Location Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter location name"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          handleLocationFieldChange("name", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      Street Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter street address"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          handleLocationFieldChange(
                            "streetAddress",
                            e.target.value
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter city"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            handleLocationFieldChange("city", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        Postcode
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter postcode"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e);
                            handleLocationFieldChange(
                              "postcode",
                              e.target.value
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location.mapLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      Map Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://maps.google.com/..."
                        type="url"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          handleLocationFieldChange("mapLink", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-2" />

        <div className="bg-background sticky bottom-0 left-0 right-0 py-4 flex items-center justify-between">
          <Button
            type="button"
            onClick={handleSubmit(onSubmitAndAddAnother)}
            disabled={!isDirty || isLoading}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add and continue
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isDirty || isLoading}
            >
              {isLoading && <div className="mr-2 h-4 w-4 animate-spin" />}
              Add and close
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

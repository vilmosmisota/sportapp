"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useUpdateGroup } from "@/entities/group/Group.actions.client";
import { DEFAULT_GROUP_COLOR, Group } from "@/entities/group/Group.schema";
import { formatAgeRange, formatGender } from "@/entities/group/Group.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Trophy, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editGroupSchema = z.object({
  ageRange: z.string().min(1, "Age range is required"),
  level: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  color: z.string().optional(),
  customName: z.string().optional(),
});

type EditGroupFormData = z.infer<typeof editGroupSchema>;

interface EditGroupFormProps {
  group: Group;
  tenantId: string;
  setIsParentModalOpen: (open: boolean) => void;
}

export default function EditGroupForm({
  group,
  tenantId,
  setIsParentModalOpen,
}: EditGroupFormProps) {
  const { tenant } = useTenantAndUserAccessContext();
  const updateGroup = useUpdateGroup(tenantId);

  // Check if custom names are enabled in tenant config
  const useCustomName = tenant?.tenantConfigs?.groups?.useCustomName ?? false;

  // Get display configuration from tenant
  const displayFields = tenant?.tenantConfigs?.groups?.displayFields || [
    "ageRange",
  ];
  const displaySeparator =
    tenant?.tenantConfigs?.groups?.displaySeparator || "•";

  // Helper function to generate display text based on tenant config
  const generateDisplayText = () => {
    if (useCustomName && form.watch("customName")) {
      return form.watch("customName");
    }

    const formattedFields = displayFields
      .map((fieldName) => {
        const fieldValue = form.watch(fieldName as keyof EditGroupFormData);
        if (!fieldValue) return null;

        switch (fieldName) {
          case "ageRange":
            return formatAgeRange(fieldValue as string);
          case "level":
            return fieldValue as string;
          case "gender":
            return formatGender(fieldValue as string, form.watch("ageRange"));
          default:
            return fieldValue as string;
        }
      })
      .filter(Boolean);

    return formattedFields.length > 0
      ? formattedFields.join(` ${displaySeparator} `)
      : "Group Display";
  };

  const form = useForm<EditGroupFormData>({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      ageRange: group.ageRange,
      level: group.level || "",
      gender: group.gender,
      color: group.appearance?.color || DEFAULT_GROUP_COLOR,
      customName: group.customName || "",
    },
  });

  const onSubmit = async (data: EditGroupFormData) => {
    try {
      const groupData: Partial<Omit<Group, "id" | "tenantId">> = {
        ageRange: data.ageRange,
        level: data.level || null,
        gender: data.gender,
        customName: data.customName?.trim() || null,
        appearance: data.color?.trim()
          ? {
              color: data.color.trim(),
            }
          : null,
      };

      await updateGroup.mutateAsync({
        groupId: group.id,
        groupData,
      });

      toast.success("Group updated successfully");
      setIsParentModalOpen(false);
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Section - Current Group Display */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: form.watch("color") }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold truncate">
                  {generateDisplayText()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Current group display (updates as you edit)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appearance Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Group Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the visual appearance of this group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value || "No color selected"}
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a color to help identify this group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Group Properties Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Group Properties</CardTitle>
              </div>
              <CardDescription>
                Define the core characteristics of this group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Age Range *
                    </FormLabel>
                    <FormControl>
                      <AgeRangeInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="e.g., 7-10, 11-12, 18-65"
                      />
                    </FormControl>
                    <FormDescription>
                      Set the age range for group members
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {useCustomName && (
                <FormField
                  control={form.control}
                  name="customName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Custom Name
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Elite Squad, Beginners Team"
                          {...field}
                          className="text-base"
                        />
                      </FormControl>
                      <FormDescription>
                        Override the default display with a custom name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => {
                    // Get configured level options from tenant
                    const levelOptions =
                      tenant?.tenantConfigs?.groups?.levelOptions || [];

                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Trophy className="h-3 w-3" />
                          Skill Level
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="text-base">
                              <SelectValue placeholder="Select skill level" />
                            </SelectTrigger>
                            <SelectContent>
                              {levelOptions.length > 0 ? (
                                levelOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>
                                  No level options configured
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          {levelOptions.length > 0
                            ? "Choose from configured skill levels"
                            : "Configure level options in group settings first"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Gender *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the gender composition
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <FormButtons
            buttonText="Update Group"
            isLoading={updateGroup.isPending}
            isDirty={form.formState.isDirty}
            onCancel={() => setIsParentModalOpen(false)}
          />
        </form>
      </Form>
    </div>
  );
}

interface AgeRangeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function AgeRangeInput({ value, onChange, placeholder }: AgeRangeInputProps) {
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const generateDisplayLabel = (min: number, max: number) => {
    if (max <= 18) {
      return `U${max}`;
    } else if (min >= 65) {
      return "Senior";
    } else {
      return "Adult";
    }
  };

  const handleRangeChange = () => {
    const min = parseInt(minAge);
    const max = parseInt(maxAge);

    if (!isNaN(min) && !isNaN(max) && min < max) {
      const rangeValue = `${min}-${max}`;
      onChange(rangeValue);
    } else {
      // Clear the value if invalid
      onChange("");
    }
  };

  // Update the form value whenever min or max age changes
  useEffect(() => {
    handleRangeChange();
  }, [minAge, maxAge]);

  const isRangeValid = () => {
    const min = parseInt(minAge);
    const max = parseInt(maxAge);
    return !isNaN(min) && !isNaN(max) && min < max;
  };

  // Parse existing value to populate fields
  useEffect(() => {
    if (value) {
      const rangeParts = value.split("-");
      if (rangeParts.length === 2) {
        const min = parseInt(rangeParts[0]);
        const max = parseInt(rangeParts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          setMinAge(min.toString());
          setMaxAge(max.toString());
        }
      }
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={minAge}
          onChange={(e) => setMinAge(e.target.value)}
          placeholder="Min age"
          min="0"
        />
        <Input
          type="number"
          value={maxAge}
          onChange={(e) => setMaxAge(e.target.value)}
          placeholder="Max age"
          min="1"
        />
      </div>
      {isRangeValid() && (
        <p className="text-xs text-muted-foreground">
          Will display as:{" "}
          {generateDisplayLabel(parseInt(minAge), parseInt(maxAge))}
        </p>
      )}
    </div>
  );
}

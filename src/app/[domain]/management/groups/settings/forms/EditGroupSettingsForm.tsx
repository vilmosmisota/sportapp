import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUpdateTenantGroupsConfig } from "@/entities/tenant/Tenant.actions.client";
import { Tenant, TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, GripVertical, List, Palette, Sliders, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const settingsSchema = z.object({
  defaultColor: z.string().optional(),
  useCustomName: z.boolean().default(false),
  defaultDisplayFields: z
    .array(z.string())
    .min(1, "At least one display field is required")
    .max(3, "Maximum 3 display fields allowed"),
  displaySeparator: z.string().min(1, "Separator is required"),
  levelOptions: z.array(z.string()),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: SettingsFormData = {
  defaultColor: "#BFDBFE", // Blue-200
  useCustomName: false,
  defaultDisplayFields: ["ageRange"],
  displaySeparator: "•",
  levelOptions: [],
};

type EditGroupSettingsFormProps = {
  tenant: Tenant;
  setSheetOpen: (open: boolean) => void;
  setIsParentModalOpen: (open: boolean) => void;
};

interface SortableDisplayFieldProps {
  id: string;
  field: string;
  index: number;
  onRemove: (field: string) => void;
  canRemove: boolean;
}

function SortableDisplayField({
  id,
  field,
  index,
  onRemove,
  canRemove,
}: SortableDisplayFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-move hover:bg-muted/80 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Badge variant="secondary" className="flex-1">
        {index + 1}. {field.replace(/([A-Z])/g, " $1")}
      </Badge>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(field)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default function EditGroupSettingsForm({
  tenant,
  setSheetOpen,
  setIsParentModalOpen,
}: EditGroupSettingsFormProps) {
  const updateTenantGroupsConfigMutation = useUpdateTenantGroupsConfig(
    tenant.id.toString(),
    tenant.domain,
    tenant.tenantConfigId ?? undefined
  );

  // Load current settings from tenant config or use defaults
  const currentSettings: SettingsFormData = {
    defaultColor:
      tenant.tenantConfigs?.groups?.defaultColor ||
      DEFAULT_SETTINGS.defaultColor,
    useCustomName:
      tenant.tenantConfigs?.groups?.useCustomName ??
      DEFAULT_SETTINGS.useCustomName,
    defaultDisplayFields:
      tenant.tenantConfigs?.groups?.defaultDisplayFields ||
      DEFAULT_SETTINGS.defaultDisplayFields,
    displaySeparator:
      tenant.tenantConfigs?.groups?.displaySeparator ||
      DEFAULT_SETTINGS.displaySeparator,
    levelOptions:
      tenant.tenantConfigs?.groups?.levelOptions ||
      DEFAULT_SETTINGS.levelOptions,
  };

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: currentSettings,
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Convert form data to TenantGroupsConfig
      const groupsConfig: TenantGroupsConfig = {
        defaultColor: data.defaultColor,
        useCustomName: data.useCustomName,
        defaultDisplayFields: data.defaultDisplayFields,
        displaySeparator: data.displaySeparator,
        levelOptions: data.levelOptions,
      };

      await updateTenantGroupsConfigMutation.mutateAsync(groupsConfig);

      toast.success("Group settings saved successfully");
      setSheetOpen(false);
    } catch (error) {
      console.error("Failed to save group settings:", error);
      toast.error("Failed to save group settings");
    }
  };

  const addLevelOption = (value: string) => {
    if (!value.trim()) return;
    const currentValues = form.getValues("levelOptions") || [];
    if (!currentValues.includes(value.trim())) {
      form.setValue("levelOptions", [...currentValues, value.trim()]);
    }
  };

  const removeLevelOption = (index: number) => {
    const currentValues = form.getValues("levelOptions") || [];
    form.setValue(
      "levelOptions",
      currentValues.filter((_, i) => i !== index)
    );
  };

  const toggleDisplayField = (field: string) => {
    const currentFields = form.getValues("defaultDisplayFields");
    if (currentFields.includes(field)) {
      if (currentFields.length > 1) {
        form.setValue(
          "defaultDisplayFields",
          currentFields.filter((f) => f !== field)
        );
      }
    } else {
      if (currentFields.length < 3) {
        form.setValue("defaultDisplayFields", [...currentFields, field]);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const currentFields = form.getValues("defaultDisplayFields");
      const oldIndex = currentFields.indexOf(active.id as string);
      const newIndex = currentFields.indexOf(over?.id as string);

      const newFields = arrayMove(currentFields, oldIndex, newIndex);
      form.setValue("defaultDisplayFields", newFields);
    }
  };

  const removeDisplayField = (field: string) => {
    const currentFields = form.getValues("defaultDisplayFields");
    if (currentFields.length > 1) {
      form.setValue(
        "defaultDisplayFields",
        currentFields.filter((f) => f !== field)
      );
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Section */}
          <div className="space-y-2">
            {/* <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Group Settings</h2>
            </div> */}
            <p className="text-sm text-muted-foreground">
              Configure default appearance and behavior for all groups
            </p>
          </div>

          <Separator />

          {/* Appearance Settings */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Appearance Settings</CardTitle>
              </div>
              <CardDescription>
                Set default colors and display preferences for new groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="defaultColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Color</FormLabel>
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
                      This color will be used as the default for new groups.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useCustomName"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Use Custom Names
                      </FormLabel>
                      <FormDescription>
                        Allow groups to have custom names instead of derived
                        field display
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

          {/* Display Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  Display Configuration
                </CardTitle>
              </div>
              <CardDescription>
                Configure how group information is displayed in tables and lists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>
                  {form.watch("useCustomName")
                    ? "Fallback Display Fields (Max 3)"
                    : "Default Display Fields (Max 3)"}
                </Label>

                {/* Selected Fields with Ordering */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={form.watch("defaultDisplayFields")}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {form
                        .watch("defaultDisplayFields")
                        .map((field, index) => (
                          <SortableDisplayField
                            key={field}
                            id={field}
                            field={field}
                            index={index}
                            onRemove={removeDisplayField}
                            canRemove={
                              form.watch("defaultDisplayFields").length > 1
                            }
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Available Fields to Add */}
                {form.watch("defaultDisplayFields").length < 3 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Add Field:
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {["ageRange", "level", "gender"]
                        .filter(
                          (field) =>
                            !form.watch("defaultDisplayFields").includes(field)
                        )
                        .map((field) => (
                          <Button
                            key={field}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDisplayField(field)}
                            className="text-xs"
                          >
                            + {field.replace(/([A-Z])/g, " $1")}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {form.watch("useCustomName")
                    ? "These fields will be used when no custom name is set. Drag to reorder."
                    : "Select up to 3 fields to display in the group table. Drag to reorder."}
                </p>
              </div>

              <FormField
                control={form.control}
                name="displaySeparator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Separator</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input
                          {...field}
                          placeholder="•"
                          className="w-20 text-center font-mono"
                          maxLength={3}
                        />
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          Preview:
                          {form
                            .watch("defaultDisplayFields")
                            .map((fieldName, index) => (
                              <span
                                key={fieldName}
                                className="flex items-center gap-1"
                              >
                                <span>
                                  {fieldName.replace(/([A-Z])/g, " $1")}
                                </span>
                                {index <
                                  form.watch("defaultDisplayFields").length -
                                    1 && (
                                  <span className="font-mono">
                                    {field.value || "•"}
                                  </span>
                                )}
                              </span>
                            ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Symbol used to separate display fields (e.g., •, |, -, ·)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Value Options */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Value Options</CardTitle>
              </div>
              <CardDescription>
                Configure the available options for group properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OptionManager
                title="Level Options"
                description="Available skill levels for groups"
                options={form.watch("levelOptions")}
                onAdd={addLevelOption}
                onRemove={removeLevelOption}
                placeholder="e.g., Beginner, Advanced"
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <FormButtons
            buttonText="Save Settings"
            isLoading={updateTenantGroupsConfigMutation.isPending}
            isDirty={form.formState.isDirty}
            onCancel={() => setSheetOpen(false)}
          />
        </form>
      </Form>
    </div>
  );
}

interface OptionManagerProps {
  title: string;
  description: string;
  options: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

function OptionManager({
  title,
  description,
  options,
  onAdd,
  onRemove,
  placeholder,
}: OptionManagerProps) {
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    onAdd(newValue);
    setNewValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={!newValue.trim()}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
          >
            <span>{option}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-1 text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

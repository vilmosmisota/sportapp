"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { RoleFormSchema, Role } from "@/entities/role/Role.schema";
import {
  Permission,
  PermissionDescriptions,
  RoleDomain,
  groupPermissionsByType,
} from "@/entities/role/Role.permissions";
import { useCreateRole, useUpdateRole } from "@/entities/role/Role.query";
import FormButtons from "@/components/ui/form-buttons";
import { rolePresets } from "@/entities/role/Role.presets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/libs/tailwind/utils";
import { formatPermissionName } from "@/entities/role/Role.utils";

interface RoleFormProps {
  initialData?: Role;
  domain?: RoleDomain;
  tenantId: number;
  setIsParentModalOpen?: (value: boolean) => void;
}

export function RoleForm({
  initialData,
  domain: initialDomain,
  tenantId,
  setIsParentModalOpen,
}: RoleFormProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole(initialData?.id || 0);

  const form = useForm({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: initialData || {
      name: "",
      domain: initialDomain || RoleDomain.MANAGEMENT,
      permissions: [],
      tenantId,
    },
  });

  const onSubmit = async (data: Role) => {
    try {
      const roleData = {
        name: data.name,
        domain: data.domain,
        permissions: data.permissions,
        tenantId,
      };

      if (initialData) {
        await updateRole.mutateAsync(roleData);
        toast.success("Role updated successfully");
      } else {
        await createRole.mutateAsync(roleData);
        toast.success("Role created successfully");
      }
      setIsParentModalOpen?.(false);
    } catch (error: any) {
      toast.error(
        error?.message ||
          (initialData ? "Failed to update role" : "Failed to create role")
      );
    }
  };

  const onCancel = () => {
    form.reset();
    setIsParentModalOpen?.(false);
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = rolePresets.find((p) => p.name === presetName);
    if (preset) {
      form.setValue("name", preset.name, { shouldDirty: true });
      form.setValue("domain", preset.domain as RoleDomain, {
        shouldDirty: true,
      });
      form.setValue("permissions", preset.permissions, { shouldDirty: true });
    }
  };

  const availablePresets = rolePresets.filter(
    (preset) =>
      !initialData && (!initialDomain || preset.domain === initialDomain)
  );

  const { viewPermissions, managePermissions } = groupPermissionsByType(
    form.watch("domain") as RoleDomain
  );

  const showPermissionsSection =
    viewPermissions.length > 0 || managePermissions.length > 0;
  const isFamily = form.watch("domain") === RoleDomain.FAMILY;
  const isPlayer = form.watch("domain") === RoleDomain.PLAYER;
  const isPresetRole = isFamily || isPlayer;

  const handleCheckAllView = (checked: boolean) => {
    const currentPermissions = form.getValues("permissions") || [];
    const newPermissions = checked
      ? Array.from(new Set([...currentPermissions, ...viewPermissions]))
      : currentPermissions.filter(
          (p) => !viewPermissions.includes(p as Permission)
        );
    form.setValue("permissions", newPermissions, { shouldDirty: true });
  };

  const handleCheckAllManage = (checked: boolean) => {
    const currentPermissions = form.getValues("permissions") || [];
    const newPermissions = checked
      ? Array.from(new Set([...currentPermissions, ...managePermissions]))
      : currentPermissions.filter(
          (p) => !managePermissions.includes(p as Permission)
        );
    form.setValue("permissions", newPermissions, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {!initialData && availablePresets.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Preset</FormLabel>
                      <Select onValueChange={handlePresetSelect}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a preset role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePresets.map((preset) => (
                            <SelectItem key={preset.name} value={preset.name}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a preset role or create a custom one
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={RoleDomain.MANAGEMENT}>
                            Management
                          </SelectItem>
                          <SelectItem value={RoleDomain.FAMILY}>
                            Family
                          </SelectItem>
                          <SelectItem value={RoleDomain.PLAYER}>
                            Player
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Only management roles can be created
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showPermissionsSection && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Permissions</FormLabel>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckAllView(true)}
                        >
                          Select All View
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckAllManage(true)}
                        >
                          Select All Manage
                        </Button>
                      </div>
                    </div>

                    {isFamily && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Family roles have implicit access to family-specific
                          features. Additional permissions are not required.
                        </AlertDescription>
                      </Alert>
                    )}

                    {isPlayer && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Player roles have implicit access to player-specific
                          features. Additional permissions are not required.
                        </AlertDescription>
                      </Alert>
                    )}

                    <FormField
                      control={form.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-4 md:grid-cols-2">
                            {/* View Permissions */}
                            {viewPermissions.length > 0 && (
                              <Card>
                                <CardContent className="pt-6">
                                  <h4 className="mb-4 text-sm font-medium">
                                    View Permissions
                                  </h4>
                                  <div className="space-y-4">
                                    {viewPermissions.map((permission) => (
                                      <FormField
                                        key={permission}
                                        control={form.control}
                                        name="permissions"
                                        render={({ field }) => (
                                          <FormItem
                                            key={permission}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(
                                                  permission
                                                )}
                                                onCheckedChange={(checked) => {
                                                  const current =
                                                    field.value || [];
                                                  const updated = checked
                                                    ? [...current, permission]
                                                    : current.filter(
                                                        (value) =>
                                                          value !== permission
                                                      );
                                                  field.onChange(updated);
                                                }}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel
                                                className={cn(
                                                  "text-sm font-normal",
                                                  field.value?.includes(
                                                    permission
                                                  ) && "font-medium"
                                                )}
                                              >
                                                {formatPermissionName(
                                                  permission
                                                )}
                                              </FormLabel>
                                              <FormDescription>
                                                {
                                                  PermissionDescriptions[
                                                    permission as Permission
                                                  ]
                                                }
                                              </FormDescription>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Manage Permissions */}
                            {managePermissions.length > 0 && (
                              <Card>
                                <CardContent className="pt-6">
                                  <h4 className="mb-4 text-sm font-medium">
                                    Manage Permissions
                                  </h4>
                                  <div className="space-y-4">
                                    {managePermissions.map((permission) => (
                                      <FormField
                                        key={permission}
                                        control={form.control}
                                        name="permissions"
                                        render={({ field }) => (
                                          <FormItem
                                            key={permission}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(
                                                  permission
                                                )}
                                                onCheckedChange={(checked) => {
                                                  const current =
                                                    field.value || [];
                                                  const updated = checked
                                                    ? [...current, permission]
                                                    : current.filter(
                                                        (value) =>
                                                          value !== permission
                                                      );
                                                  field.onChange(updated);
                                                }}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel
                                                className={cn(
                                                  "text-sm font-normal",
                                                  field.value?.includes(
                                                    permission
                                                  ) && "font-medium"
                                                )}
                                              >
                                                {formatPermissionName(
                                                  permission
                                                )}
                                              </FormLabel>
                                              <FormDescription>
                                                {
                                                  PermissionDescriptions[
                                                    permission as Permission
                                                  ]
                                                }
                                              </FormDescription>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText={initialData ? "Update Role" : "Create Role"}
            isLoading={form.formState.isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

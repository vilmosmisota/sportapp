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
import {
  Domain,
  TenantType,
  RoleFormSchema,
  Role,
} from "@/entities/role/Role.schema";
import {
  Permission,
  PermissionDescriptions,
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
  domain?: Domain;
  tenantType: TenantType;
  setIsParentModalOpen?: (value: boolean) => void;
}

export function RoleForm({
  initialData,
  domain: initialDomain,
  tenantType,
  setIsParentModalOpen,
}: RoleFormProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole(initialData?.id || "");

  const form = useForm({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: initialData || {
      name: "",
      domain: initialDomain || Domain.MANAGEMENT,
      tenantType: tenantType,
      permissions: [],
    },
  });

  const onSubmit = async (data: Role) => {
    try {
      const roleData = {
        name: data.name,
        domain: data.domain,
        tenantType: tenantType,
        permissions: data.permissions,
      } as const;

      if (initialData) {
        await updateRole.mutateAsync(roleData);
        toast.success("Role updated successfully");
      } else {
        console.log("Creating role with data:", roleData); // Debug log
        await createRole.mutateAsync(roleData);
        toast.success("Role created successfully");
      }
      setIsParentModalOpen?.(false);
    } catch (error: any) {
      console.error("Error creating/updating role:", error); // Debug log
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
      form.setValue("name", preset.name);
      form.setValue("domain", preset.domain, { shouldDirty: true });
      form.setValue("tenantType", preset.tenantType);
      form.setValue("permissions", preset.permissions);
    }
  };

  const availablePresets = rolePresets.filter(
    (preset) =>
      !initialData && (!initialDomain || preset.domain === initialDomain)
  );

  const { viewPermissions, managePermissions } = groupPermissionsByType(
    form.watch("domain") as Domain
  );

  const showPermissionsSection =
    viewPermissions.length > 0 || managePermissions.length > 0;
  const isFamily = form.watch("domain") === Domain.FAMILY;

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
        {!initialData && availablePresets.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <FormItem>
                <FormLabel>Role Template</FormLabel>
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
            </CardContent>
          </Card>
        )}

        {initialData && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Editing this role will affect all users who have this role
              assigned
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Role name" {...field} />
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
                      value={field.value}
                      disabled={!!initialDomain}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Domain).map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isFamily ? (
                <div className="rounded-lg border border-dashed p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Family Domain Access</h4>
                    <p className="text-sm text-muted-foreground">
                      This role grants access to the family dashboard. Users
                      with this role will be able to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>
                        View their children&apos;s profiles and information
                      </li>
                      <li>Access training schedules and attendance records</li>
                      <li>Submit forms and manage attendance</li>
                      <li>Receive notifications and updates</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      No additional permissions are needed as all features are
                      automatically available in the family dashboard.
                    </p>
                  </div>
                </div>
              ) : (
                showPermissionsSection && (
                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Permissions</FormLabel>
                          <FormDescription>
                            Select the permissions for this role
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          {viewPermissions.length > 0 && (
                            <div className="space-y-4">
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={viewPermissions.every((p) =>
                                      form.getValues("permissions")?.includes(p)
                                    )}
                                    onCheckedChange={handleCheckAllView}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>View Permissions</FormLabel>
                                  <FormDescription>
                                    Select all view permissions
                                  </FormDescription>
                                </div>
                              </FormItem>
                              <div className="space-y-2">
                                {viewPermissions.map((permission) => (
                                  <FormField
                                    key={permission}
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                      <FormItem
                                        key={permission}
                                        className="flex flex-row items-start space-x-3 space-y-0 ml-2"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              permission
                                            )}
                                            onCheckedChange={(checked) => {
                                              const value = field.value || [];
                                              return checked
                                                ? field.onChange([
                                                    ...value,
                                                    permission,
                                                  ])
                                                : field.onChange(
                                                    value.filter(
                                                      (p) => p !== permission
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal">
                                            {formatPermissionName(permission)}
                                          </FormLabel>
                                          <FormDescription className="text-xs">
                                            {PermissionDescriptions[permission]}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {managePermissions.length > 0 && (
                            <div className="space-y-4">
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={managePermissions.every((p) =>
                                      form.getValues("permissions")?.includes(p)
                                    )}
                                    onCheckedChange={handleCheckAllManage}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Manage Permissions</FormLabel>
                                  <FormDescription>
                                    Select all manage permissions
                                  </FormDescription>
                                </div>
                              </FormItem>
                              <div className="space-y-2">
                                {managePermissions.map((permission) => (
                                  <FormField
                                    key={permission}
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                      <FormItem
                                        key={permission}
                                        className="flex flex-row items-start space-x-3 space-y-0 ml-2"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              permission
                                            )}
                                            onCheckedChange={(checked) => {
                                              const value = field.value || [];
                                              return checked
                                                ? field.onChange([
                                                    ...value,
                                                    permission,
                                                  ])
                                                : field.onChange(
                                                    value.filter(
                                                      (p) => p !== permission
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="font-normal">
                                            {formatPermissionName(permission)}
                                          </FormLabel>
                                          <FormDescription className="text-xs">
                                            {PermissionDescriptions[permission]}
                                          </FormDescription>
                                        </div>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText={initialData ? "Update Role" : "Create Role"}
            isLoading={createRole.isPending || updateRole.isPending}
            isDirty={form.formState.isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

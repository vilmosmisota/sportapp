import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormButtons from "@/components/ui/form-buttons";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "@/entities/user/User.actions.client";
import {
  User,
  UserUpdateFormSchema,
  UserRole,
} from "@/entities/user/User.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/entities/role/Role.schema";
import { RoleDomain } from "@/entities/role/Role.permissions";
import { useRolesByTenant } from "@/entities/role/Role.query";
import { Button } from "@/components/ui/button";
import { X, Users, Mail, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const FORM_DOMAINS = [RoleDomain.MANAGEMENT, RoleDomain.FAMILY] as const;
type FormDomain = (typeof FORM_DOMAINS)[number];

const DOMAIN_LABELS: Record<FormDomain, string> = {
  [RoleDomain.MANAGEMENT]: "Management",
  [RoleDomain.FAMILY]: "Family",
};

const DOMAIN_ROLE_LIMITS: Record<FormDomain, number> = {
  [RoleDomain.MANAGEMENT]: 1,
  [RoleDomain.FAMILY]: 1,
};

type EditUserFormProps = {
  user: User;
  tenantId: string;
  setIsParentModalOpen?: (value: boolean) => void;
};

// Extended schema to include roleIds
const ExtendedUserUpdateFormSchema = UserUpdateFormSchema.extend({
  roleIds: z.array(z.number()).optional(),
});

export default function EditUserForm({
  user,
  tenantId,
  setIsParentModalOpen,
}: EditUserFormProps) {
  const updateUser = useUpdateUser(user.id, tenantId);
  const { data: roles = [], isLoading } = useRolesByTenant(Number(tenantId));
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(
    user.roles?.map((r) => r.roleId) ?? []
  );
  const initialRoleIds = user.roles?.map((r) => r.roleId) ?? [];

  // Track if roles have changed
  const hasRolesChanged =
    JSON.stringify(selectedRoleIds.sort()) !==
    JSON.stringify(initialRoleIds.sort());

  const form = useForm<z.infer<typeof ExtendedUserUpdateFormSchema>>({
    resolver: zodResolver(ExtendedUserUpdateFormSchema),
    defaultValues: {
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      roleIds: selectedRoleIds,
    },
  });

  // Form is dirty if either regular fields or roles have changed
  const isFormDirty = form.formState.isDirty || hasRolesChanged;

  const onSubmit = (data: z.infer<typeof ExtendedUserUpdateFormSchema>) => {
    const { roleIds, ...userData } = data;
    updateUser.mutate(
      {
        userData,
        roleIds: selectedRoleIds,
      },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          setIsParentModalOpen?.(false);
        },
        onError: () => {
          toast.error("Failed to update user");
        },
      }
    );
  };

  const onCancel = () => {
    form.reset();
    setSelectedRoleIds(user.roles?.map((r) => r.roleId) ?? []);
    setIsParentModalOpen?.(false);
  };

  const handleAssignRole = (roleId: number, domain: FormDomain) => {
    const currentDomainRoles = selectedRoleIds.filter((id) => {
      const role = roles.find((r) => r.id === id);
      return role?.domain === domain;
    });

    if (currentDomainRoles.length >= DOMAIN_ROLE_LIMITS[domain]) {
      toast.error(
        `Users can only have ${DOMAIN_ROLE_LIMITS[domain]} ${DOMAIN_LABELS[domain]} role`
      );
      return;
    }

    setSelectedRoleIds((prev) => [...prev, roleId]);
  };

  const handleRemoveRole = (roleId: number) => {
    setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
  };

  const availableRoles: Record<FormDomain, Role[]> = {
    [RoleDomain.MANAGEMENT]: roles.filter(
      (r) => r.domain === RoleDomain.MANAGEMENT
    ),
    [RoleDomain.FAMILY]: roles.filter((r) => r.domain === RoleDomain.FAMILY),
  };

  const renderRoleSection = (domain: FormDomain) => {
    const domainRoles = availableRoles[domain];
    const selectedDomainRoleIds = selectedRoleIds.filter((id) => {
      const role = roles.find((r) => r.id === id);
      return role?.domain === domain;
    });

    return (
      <Card key={domain}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {DOMAIN_LABELS[domain]} Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Roles */}
          <div className="space-y-2">
            <FormLabel>Current Roles</FormLabel>
            <div className="flex flex-wrap gap-2">
              {selectedDomainRoleIds.length > 0 ? (
                selectedDomainRoleIds.map((roleId) => {
                  const role = roles.find((r) => r.id === roleId);
                  return role ? (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                    >
                      {role.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-destructive"
                        onClick={() => handleRemoveRole(role.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No roles assigned
                </p>
              )}
            </div>
          </div>

          {/* Available Roles */}
          <div className="space-y-2">
            <FormLabel>Available Roles</FormLabel>
            {isLoading ? (
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            ) : domainRoles.length ? (
              <div className="flex flex-wrap gap-2">
                {domainRoles
                  .filter((role) => !selectedRoleIds.includes(role.id))
                  .map((role) => (
                    <Button
                      key={role.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignRole(role.id, domain)}
                      disabled={
                        selectedDomainRoleIds.length >=
                        DOMAIN_ROLE_LIMITS[domain]
                      }
                    >
                      {role.name}
                    </Button>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No roles available
              </p>
            )}
            {selectedDomainRoleIds.length >= DOMAIN_ROLE_LIMITS[domain] && (
              <p className="text-xs text-muted-foreground mt-2">
                Maximum {DOMAIN_ROLE_LIMITS[domain]} {DOMAIN_LABELS[domain]}{" "}
                role allowed
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 relative"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="text-sm">
                <Mail className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-sm">
                <Users className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 mt-4">
              {FORM_DOMAINS.map((domain) => renderRoleSection(domain))}
            </TabsContent>
          </Tabs>
        </div>

        <FormButtons
          buttonText="Save Changes"
          onCancel={onCancel}
          isLoading={updateUser.isPending}
          isDirty={isFormDirty}
        />
      </form>
    </Form>
  );
}

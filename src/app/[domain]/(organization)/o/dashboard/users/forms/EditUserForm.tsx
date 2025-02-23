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
import { User, UserUpdateFormSchema } from "@/entities/user/User.schema";
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

export default function EditUserForm({
  user,
  tenantId,
  setIsParentModalOpen,
}: EditUserFormProps) {
  const updateUser = useUpdateUser(user.id, tenantId);
  const { data: roles = [], isLoading } = useRolesByTenant(Number(tenantId));
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(
    user.roles.map((r) => r.roleId)
  );

  const form = useForm<z.infer<typeof UserUpdateFormSchema>>({
    resolver: zodResolver(UserUpdateFormSchema),
    defaultValues: {
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  });

  const onSubmit = (data: z.infer<typeof UserUpdateFormSchema>) => {
    updateUser.mutate(
      {
        userData: {
          ...data,
          roleIds: selectedRoleIds,
        },
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
    // Reset both form and role changes
    form.reset();
    setSelectedRoleIds(user.roles.map((r) => r.roleId));
    setIsParentModalOpen?.(false);
  };

  const handleAssignRole = (
    e: React.MouseEvent,
    roleId: string,
    domain: FormDomain
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let userRole = user.roles.find((r) => r.roleId === parseInt(roleId));
    const currentRoleCount = userRole?.roles?.length ?? 0;

    if (currentRoleCount >= DOMAIN_ROLE_LIMITS[domain]) {
      toast.error(
        `Users can only have ${DOMAIN_ROLE_LIMITS[domain]} ${DOMAIN_LABELS[domain]} role`
      );
      return;
    }

    // If role doesn't exist, create it
    if (!userRole) {
      userRole = {
        id: Date.now(),
        userId: user.id,
        tenantId: parseInt(tenantId),
        role: { id: parseInt(roleId), name: "" },
        roles: [],
      };
    }

    // Update local state
    setSelectedRoleIds((prev) => {
      if (userRole) {
        const otherRoles = prev.filter((r) => r !== parseInt(roleId));
        return [...otherRoles, parseInt(roleId)];
      }
      return prev;
    });
  };

  const handleRemoveRole = (
    e: React.MouseEvent,
    roleId: string,
    domain: FormDomain
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedRoleIds((prev) => prev.filter((r) => r !== parseInt(roleId)));
  };

  const availableRoles: Record<FormDomain, Role[]> = {
    [RoleDomain.MANAGEMENT]: roles.filter((r) => r.role.id.startsWith("M")),
    [RoleDomain.FAMILY]: roles.filter((r) => r.role.id.startsWith("F")),
  };

  const renderRoleSection = (domain: FormDomain) => {
    const userRole = user.roles.find((r) => r.roleId === domain);
    const assignedRoleIds = userRole?.roles?.map((r) => r.id) ?? [];
    const domainRoles = availableRoles[domain];
    const currentRoleCount = userRole?.roles?.length ?? 0;

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
              {userRole?.roles?.length ? (
                userRole.roles.map((role: Role) => (
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
                      onClick={(e) =>
                        handleRemoveRole(e, role.id.toString(), domain)
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
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
                  .filter((role: Role) => !assignedRoleIds.includes(role.id))
                  .map((role: Role) => (
                    <Button
                      key={role.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) =>
                        handleAssignRole(e, role.id.toString(), domain)
                      }
                      disabled={currentRoleCount >= DOMAIN_ROLE_LIMITS[domain]}
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
            {currentRoleCount >= DOMAIN_ROLE_LIMITS[domain] && (
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
                User Details
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-sm">
                Roles & Permissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6 mt-6">
              {FORM_DOMAINS.map((domain) => renderRoleSection(domain))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-background sticky h-[100px] flex items-center justify-end bottom-0 left-0 right-0 border-t">
          <FormButtons
            buttonText="Save"
            isLoading={form.formState.isSubmitting}
            isDirty={form.formState.isDirty}
            onCancel={onCancel}
          />
        </div>
      </form>
    </Form>
  );
}

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useToggleUserRolePrimary,
  useUserRolesByTenant,
} from "@/entities/role/hooks/useUserRoles";

import { useCurrentUser } from "@/entities/user/User.query";
import { AlertCircle, Shield, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTenantAndUserAccessContext } from "../../../../../../composites/auth/TenantAndUserAccessContext";

export default function RolesSettingsPage() {
  const params = useParams();
  const domain = Array.isArray(params.domain)
    ? params.domain[0]
    : params.domain;

  const { tenant, isLoading: isLoadingTenant } =
    useTenantAndUserAccessContext();

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: userRoles = [], isLoading: isLoadingRoles } =
    useUserRolesByTenant(currentUser?.id ?? "", tenant?.id ?? 0, {
      enabled: !!currentUser?.id && !!tenant?.id,
    });

  const togglePrimary = useToggleUserRolePrimary(
    currentUser?.id ?? "",
    tenant?.id ?? 0
  );

  const handleTogglePrimary = async (roleId: number) => {
    try {
      await togglePrimary.mutateAsync(roleId);
      toast.success("Role primary status updated");
    } catch (error) {
      console.error("Failed to toggle primary role:", error);
      toast.error("Failed to update role primary status");
    }
  };

  if (isLoadingUser || isLoadingRoles || isLoadingTenant || isLoadingUser) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-muted-foreground">
            Manage your roles and permissions.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      </div>
    );
  }

  // Error state if we can't get tenant info
  if (!tenant?.id) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-muted-foreground">
            Manage your roles and permissions.
          </p>
        </div>
        <Separator />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load roles. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userRoles?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-muted-foreground">
            Manage your roles and permissions.
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No roles assigned to your account in this tenant.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Roles</h3>
        <p className="text-sm text-muted-foreground">
          Manage your roles and permissions.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        {userRoles.map((userRole) => (
          <Card key={userRole.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {userRole.role?.name}
                </div>
                {userRole.isPrimary && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    Primary
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Domain: {userRole.role?.domain}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {userRole.role?.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="outline"
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePrimary(userRole.roleId)}
                  disabled={togglePrimary.isPending}
                >
                  {userRole.isPrimary ? "Remove Primary" : "Make Primary"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

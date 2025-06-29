"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Access } from "@/entities/role/Role.schema";
import { AlertCircle, Shield } from "lucide-react";
import { useTenantAndUserAccessContext } from "../../../../../composites/auth/TenantAndUserAccessContext";

export default function RolesSettingsPage() {
  const { tenantUser, tenant, isLoading } = useTenantAndUserAccessContext();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-muted-foreground">
            View your role and permissions.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
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
            View your role and permissions.
          </p>
        </div>
        <Separator />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load role information. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tenantUser?.role) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Roles</h3>
          <p className="text-sm text-muted-foreground">
            View your role and permissions.
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No role assigned to your account in this organization.
          </CardContent>
        </Card>
      </div>
    );
  }

  const role = tenantUser.role;

  // Get access badge styles
  const getAccessBadgeStyle = (accessType: Access) => {
    switch (accessType) {
      case Access.MANAGEMENT:
        return "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300";
      case Access.ATTENDANCE:
        return "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300";
      case Access.SYSTEM:
        return "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300";
      default:
        return "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Roles</h3>
        <p className="text-sm text-muted-foreground">
          View your role and permissions.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {role.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Access Levels */}
          {role.access && role.access.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Access Levels
              </h4>
              <div className="flex flex-wrap gap-2">
                {role.access.map((accessType) => (
                  <Badge
                    key={accessType}
                    variant="secondary"
                    className={getAccessBadgeStyle(accessType)}
                  >
                    {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          {role.permissions && role.permissions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* No permissions message */}
          {(!role.permissions || role.permissions.length === 0) &&
            (!role.access || role.access.length === 0) && (
              <p className="text-sm text-muted-foreground">
                This role has no specific permissions or access levels assigned.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

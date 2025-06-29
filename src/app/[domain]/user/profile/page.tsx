"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";

export default function ProfilePage() {
  const { tenantUser: user, isLoading } = useTenantAndUserAccessContext();

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 bg-muted/40">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              View and manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user?.user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Additional information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium">Account ID</p>
              <p className="text-sm font-mono text-muted-foreground">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

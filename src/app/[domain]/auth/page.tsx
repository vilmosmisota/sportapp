"use client";

import { useCurrentUser } from "@/entities/user/User.query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Bell, HelpCircle, Settings, UserRound } from "lucide-react";

export default function AuthPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null;
  }

  const initials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "N/A";

  // Get primary role or fall back to first role
  const primaryRole = user?.roles?.find((role) => role.isPrimary);
  const displayRole = primaryRole || user?.roles?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Overview"
        description="Manage your account settings and preferences"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {displayRole?.role?.name || "Member"}
                </p>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/auth/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">Account Preferences</p>
              <p className="text-xs text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/auth/settings">View Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">Notification Preferences</p>
              <p className="text-xs text-muted-foreground">
                Manage your notification settings
              </p>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/auth/notifications">View Notifications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Help & Support
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">Support Center</p>
              <p className="text-xs text-muted-foreground">
                Get help and support for your account
              </p>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/auth/help">View Help</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

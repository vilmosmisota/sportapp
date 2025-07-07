"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Tag, Users2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/ui/page-header";
import { ResponsiveSheet } from "../../../../components/ui/responsive-sheet";
import EditManagementSettingsForm from "../../../../composites/forms/settings/EditManagementSettingsForm";

export default function ManagementSettingsPage() {
  const { tenant, isLoading, error } = useTenantAndUserAccessContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Management Settings
          </h1>
          <p className="text-muted-foreground">
            Configure performers and groups settings for your organization.
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Management Settings
          </h1>
          <p className="text-muted-foreground">
            Configure performers and groups settings for your organization.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Failed to load tenant information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performersConfig = tenant.tenantConfigs?.performers;
  const groupsConfig = tenant.tenantConfigs?.groups;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Management Settings"
        description="Configure performers and groups settings for your organization."
        actions={<Button onClick={() => setIsEditOpen(true)}>Edit</Button>}
      />

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Management Settings"
      >
        <EditManagementSettingsForm
          tenant={tenant}
          onCancel={() => setIsEditOpen(false)}
          onSuccess={() => setIsEditOpen(false)}
        />
      </ResponsiveSheet>

      {/* Performers Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Performers Configuration
          </CardTitle>
          <CardDescription>
            Settings for how performers are displayed and managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Display Name
              </label>
              <p className="text-sm font-medium capitalize">
                {performersConfig?.displayName || "performers"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                URL Slug
              </label>
              <p className="text-sm font-medium">
                {performersConfig?.slug || "performers"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Groups Configuration
          </CardTitle>
          <CardDescription>
            Settings for how groups are displayed and organized
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Use Custom Name
              </label>
              <Badge
                variant={groupsConfig?.useCustomName ? "default" : "secondary"}
              >
                {groupsConfig?.useCustomName ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Display Separator
              </label>
              <p className="text-sm font-medium">
                {groupsConfig?.displaySeparator || "•"}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Display Fields
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {groupsConfig?.displayFields?.map((field, index) => (
                <Badge key={index} variant="outline">
                  {field}
                </Badge>
              )) || <Badge variant="outline">ageRange</Badge>}
            </div>
          </div>

          {groupsConfig?.levelOptions &&
            groupsConfig.levelOptions.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Level Options
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {groupsConfig.levelOptions.map((level, index) => (
                      <Badge key={index} variant="secondary">
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

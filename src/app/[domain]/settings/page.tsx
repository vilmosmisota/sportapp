"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Separator } from "@/components/ui/separator";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import EditGlobalSettingsForm from "@/composites/forms/settings/EditGeneralSettingsForm";
import { Building2, Globe, MapPin, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { PageHeader } from "../../../components/ui/page-header";

export default function GlobalSettingsPage() {
  const { tenant, isLoading, error } = useTenantAndUserAccessContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            General Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s general settings and information.
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
            General Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s general settings and information.
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

  const generalConfig = tenant.tenantConfigs?.general;

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        description="Manage your organization's general settings and information."
        actions={
          <Button onClick={() => setIsEditOpen(true)}>Edit Settings</Button>
        }
      />

      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Global Settings"
      >
        <EditGlobalSettingsForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-sm font-medium">{tenant.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <Badge variant="secondary" className="capitalize">
                {tenant.type}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Domain
              </label>
              <p className="text-sm font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {tenant.domain}
              </p>
            </div>
            {generalConfig?.sport && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sport
                </label>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {generalConfig.sport}
                </p>
              </div>
            )}
          </div>

          {generalConfig?.description && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm text-foreground mt-1">
                  {generalConfig.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      {generalConfig?.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
            <CardDescription>
              Organization&apos;s primary location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generalConfig.location.streetAddress && (
                <p className="text-sm">
                  {generalConfig.location.streetAddress}
                </p>
              )}
              <div className="flex gap-2 text-sm">
                {generalConfig.location.city && (
                  <span>{generalConfig.location.city}</span>
                )}
                {generalConfig.location.postcode && (
                  <span>{generalConfig.location.postcode}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logo */}
      {generalConfig?.logo && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>Your organization&apos;s logo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={generalConfig.logo} />
              </Avatar>
              <div>
                <p className="text-sm font-medium">Logo URL</p>
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {generalConfig.logo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

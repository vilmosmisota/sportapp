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
import { Building2, Globe, Mail, MapPin, Trophy } from "lucide-react";
import { useTenantAndUserAccessContext } from "../../../composites/auth/TenantAndUserAccessContext";

export default function GlobalSettingsPage() {
  const { tenant, isLoading, error } = useTenantAndUserAccessContext();

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s general settings and information.
        </p>
      </div>

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

      {/* Email Configuration */}
      {tenant.tenantConfigs?.emailConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Email settings for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenant.tenantConfigs.emailConfig.senderEmail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sender Email
                  </label>
                  <p className="text-sm font-medium">
                    {tenant.tenantConfigs.emailConfig.senderEmail}
                  </p>
                </div>
              )}
              {tenant.tenantConfigs.emailConfig.senderName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sender Name
                  </label>
                  <p className="text-sm font-medium">
                    {tenant.tenantConfigs.emailConfig.senderName}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Transactional Emails
                </label>
                <Badge
                  variant={
                    tenant.tenantConfigs.emailConfig.enableTransactional
                      ? "default"
                      : "secondary"
                  }
                >
                  {tenant.tenantConfigs.emailConfig.enableTransactional
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Marketing Emails
                </label>
                <Badge
                  variant={
                    tenant.tenantConfigs.emailConfig.enableMarketing
                      ? "default"
                      : "secondary"
                  }
                >
                  {tenant.tenantConfigs.emailConfig.enableMarketing
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
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
              <img
                src={generalConfig.logo}
                alt="Organization Logo"
                className="h-16 w-16 object-contain rounded-lg border"
              />
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

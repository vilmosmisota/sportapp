import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/composites/auth/PermissionButton";
import { Permission } from "@/entities/role/Role.permissions";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import {
  Building2,
  Calendar,
  FileText,
  Hash,
  MapPin,
  SquarePen,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { useState } from "react";
import EditGeneralForm from "../forms/EditGeneralForm";

type GeneralContentProps = {
  tenant?: Tenant;
};

export default function GeneralContent({ tenant }: GeneralContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!tenant) {
    return null;
  }

  const generalConfig = tenant.tenantConfigs?.general;

  return (
    <>
      <ResponsiveSheet
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit General Settings"
      >
        <EditGeneralForm
          tenant={tenant}
          setSheetOpen={setIsEditOpen}
          setIsParentModalOpen={setIsEditOpen}
        />
      </ResponsiveSheet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                {generalConfig?.logo ? (
                  <AvatarImage
                    src={generalConfig.logo}
                    alt={`${tenant.name} logo`}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {tenant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize">
                  {tenant.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  @{tenant.domain}
                </span>
              </div>
            </div>
          </div>
          <PermissionButton
            permission={Permission.MANAGE_SETTINGS_ORGANIZATION}
            onClick={() => setIsEditOpen(true)}
            className="gap-2"
          >
            <SquarePen className="h-4 w-4" />
            Edit Settings
          </PermissionButton>
        </div>

        {/* Description Section */}
        {generalConfig?.description && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-foreground mb-1">
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {generalConfig.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Organization Name
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {tenant.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Type
                  </span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {tenant.type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Domain
                  </span>
                  <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                    {tenant.domain}
                  </span>
                </div>
                {generalConfig?.sport && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Sport
                    </span>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {generalConfig.sport}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generalConfig?.location ? (
                <div className="space-y-3">
                  {generalConfig.location.name && (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {generalConfig.location.name}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground space-y-1">
                    {generalConfig.location.streetAddress && (
                      <p>{generalConfig.location.streetAddress}</p>
                    )}
                    {(generalConfig.location.city ||
                      generalConfig.location.postcode) && (
                      <p>
                        {generalConfig.location.city}
                        {generalConfig.location.city &&
                          generalConfig.location.postcode &&
                          ", "}
                        {generalConfig.location.postcode}
                      </p>
                    )}
                  </div>
                  {generalConfig.location.mapLink && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 text-xs"
                      >
                        <a
                          href={generalConfig.location.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          View on Map
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No location set
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Add location information in settings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-muted rounded-lg">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </div>
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Hash className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Tenant ID</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {tenant.id}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Hash className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Config ID</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {tenant.tenantConfigId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

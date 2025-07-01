"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function SchedulingSettingsPage() {
  const { tenant, isLoading, error } = useTenantAndUserAccessContext();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Scheduling Settings
          </h1>
          <p className="text-muted-foreground">
            Manage session locations and scheduling configuration.
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
            Scheduling Settings
          </h1>
          <p className="text-muted-foreground">
            Manage session locations and scheduling configuration.
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

  const developmentConfig = tenant.tenantConfigs?.development;
  const generalLocation = tenant.tenantConfigs?.general?.location;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Scheduling Settings
        </h1>
        <p className="text-muted-foreground">
          Manage session locations and scheduling configuration.
        </p>
      </div>

      {/* Primary Location */}
      {generalLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Primary Location
            </CardTitle>
            <CardDescription>
              Main organization location used for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {generalLocation.name || "Primary Location"}
              </div>
              {generalLocation.streetAddress && (
                <p className="text-sm text-muted-foreground">
                  {generalLocation.streetAddress}
                </p>
              )}
              <div className="flex gap-2 text-sm text-muted-foreground">
                {generalLocation.city && <span>{generalLocation.city}</span>}
                {generalLocation.postcode && (
                  <span>{generalLocation.postcode}</span>
                )}
              </div>
              {generalLocation.mapLink && (
                <div className="pt-2">
                  <a
                    href={generalLocation.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View on Map
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Locations */}
      {developmentConfig?.trainingLocations &&
        developmentConfig.trainingLocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Training Locations
              </CardTitle>
              <CardDescription>
                Available locations for scheduling training sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developmentConfig.trainingLocations.map((location, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="font-medium text-sm">
                          {location.name || `Training Location ${index + 1}`}
                        </div>
                        {location.streetAddress && (
                          <p className="text-sm text-muted-foreground">
                            {location.streetAddress}
                          </p>
                        )}
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          {location.city && <span>{location.city}</span>}
                          {location.postcode && (
                            <span>{location.postcode}</span>
                          )}
                        </div>
                        {location.coordinates && (
                          <div className="text-xs text-muted-foreground">
                            Coordinates: {location.coordinates.latitude},{" "}
                            {location.coordinates.longitude}
                          </div>
                        )}
                      </div>
                      {location.mapLink && (
                        <a
                          href={location.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline ml-4"
                        >
                          View Map
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Scheduling Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduling Configuration
          </CardTitle>
          <CardDescription>
            General scheduling settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Locations Available
                </label>
                <p className="text-2xl font-bold">
                  {(developmentConfig?.trainingLocations?.length || 0) +
                    (generalLocation ? 1 : 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Including primary and training locations
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Organization Type
                </label>
                <Badge variant="secondary" className="capitalize">
                  {tenant.type}
                </Badge>
              </div>
            </div>

            {(!developmentConfig?.trainingLocations ||
              developmentConfig.trainingLocations.length === 0) &&
              !generalLocation && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No locations configured. Add training locations or set up
                    your primary location to enable scheduling.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

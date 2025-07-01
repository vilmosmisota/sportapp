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
import { Clock, Palette, Smartphone, UserCheck } from "lucide-react";

export default function AttendanceSettingsPage() {
  const { tenant, isLoading, error } = useTenantAndUserAccessContext();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance Settings
          </h1>
          <p className="text-muted-foreground">
            Configure attendance tracking and check-in settings.
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
            Attendance Settings
          </h1>
          <p className="text-muted-foreground">
            Configure attendance tracking and check-in settings.
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

  const attendanceConfig = tenant.tenantConfigs?.attendance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance Settings
        </h1>
        <p className="text-muted-foreground">
          Configure attendance tracking and check-in settings.
        </p>
      </div>

      {/* Check-in Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Check-in Configuration
          </CardTitle>
          <CardDescription>
            Settings for how members check in to sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Check-in Mode
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="capitalize">
                  {attendanceConfig?.checkInMode?.replace("_", " ") ||
                    "PIN 4 Digit"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Late Threshold
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {attendanceConfig?.lateThreshold || 5} minutes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kiosk Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Kiosk Styling
          </CardTitle>
          <CardDescription>
            Visual customization for check-in kiosks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Primary Color
              </label>
              <div className="flex items-center gap-2 mt-1">
                {attendanceConfig?.kioskStyling?.primaryColor ? (
                  <>
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor:
                          attendanceConfig.kioskStyling.primaryColor,
                      }}
                    />
                    <span className="text-sm font-medium">
                      {attendanceConfig.kioskStyling.primaryColor}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Not configured
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Background Color
              </label>
              <div className="flex items-center gap-2 mt-1">
                {attendanceConfig?.kioskStyling?.backgroundColor ? (
                  <>
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor:
                          attendanceConfig.kioskStyling.backgroundColor,
                      }}
                    />
                    <span className="text-sm font-medium">
                      {attendanceConfig.kioskStyling.backgroundColor}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Not configured
                  </span>
                )}
              </div>
            </div>
          </div>

          {(attendanceConfig?.kioskStyling?.primaryColor ||
            attendanceConfig?.kioskStyling?.backgroundColor) && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Kiosk Preview
                </label>
                <div
                  className="mt-2 p-6 rounded-lg border-2 border-dashed"
                  style={{
                    backgroundColor:
                      attendanceConfig?.kioskStyling?.backgroundColor ||
                      "#ffffff",
                    color:
                      attendanceConfig?.kioskStyling?.primaryColor || "#000000",
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">
                      Check-in Kiosk
                    </div>
                    <div
                      className="inline-block px-4 py-2 rounded-lg text-white text-sm"
                      style={{
                        backgroundColor:
                          attendanceConfig?.kioskStyling?.primaryColor ||
                          "#3b82f6",
                      }}
                    >
                      Sample Button
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
          <CardDescription>
            Current attendance configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {attendanceConfig?.lateThreshold || 5}
                </div>
                <div className="text-xs text-muted-foreground">
                  Minutes Late Threshold
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold capitalize">
                  {attendanceConfig?.checkInMode?.replace("_", " ") || "PIN"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Check-in Method
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">
                  {attendanceConfig?.kioskStyling?.primaryColor ? "Yes" : "No"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Custom Colors
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">Active</div>
                <div className="text-xs text-muted-foreground">
                  System Status
                </div>
              </div>
            </div>

            {(!attendanceConfig ||
              (!attendanceConfig.checkInMode &&
                !attendanceConfig.lateThreshold)) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Attendance configuration is using default settings. Consider
                  customizing these settings for your organization&apos;s needs.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { getPortalConfig } from "@/composites/dashboard/types/portalConfigs";
import { getAvailablePortals } from "@/composites/dashboard/utils/dashboardUtils";
import {
  ArrowRight,
  Clock,
  Fingerprint,
  HelpCircle,
  Mail,
  MapPin,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface PlatformPageProps {
  params: {
    domain: string;
  };
}

export default function PlatformPage({ params }: PlatformPageProps) {
  const { tenant, tenantUser, isLoading, error } =
    useTenantAndUserAccessContext();

  const availablePortals = React.useMemo(() => {
    if (!tenantUser?.role?.access) return [];
    return getAvailablePortals(tenantUser.role.access);
  }, [tenantUser]);

  if (isLoading) {
    return (
      <div className="w-full space-y-8 max-w-6xl mx-auto px-2 sm:px-6">
        {/* Tenant Details Section */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-b border-border/30">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div>
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-96 mb-1" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
          <nav className="flex gap-4 items-center mt-4 sm:mt-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-full" />
            ))}
          </nav>
        </section>

        {/* User Details Section */}
        <section className="flex items-center gap-4 p-4 rounded-lg border border-border/30 bg-muted/30 max-w-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-4 w-36 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </section>

        {/* Available Portals Section */}
        <section>
          <Skeleton className="h-7 w-32 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border border-border/40 rounded-lg shadow-sm"
                style={{ borderLeft: "6px solid #e2e8f0" }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/50 text-center mt-12">
          <Skeleton className="h-4 w-48 mx-auto" />
        </footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Error</CardTitle>
            <CardDescription>
              There was an issue loading your workspace. Please try refreshing
              the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tenantConfig = tenant?.tenantConfigs?.general;
  const sport = tenantConfig?.sport;
  const location = tenantConfig?.location;
  const description = tenantConfig?.description;

  return (
    <div className="w-full space-y-8 max-w-6xl mx-auto px-2 sm:px-6">
      {/* Tenant Details Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-b border-border/30">
        <div className="flex items-center gap-4">
          {tenantConfig?.logo && (
            <Avatar className="h-14 w-14">
              <AvatarImage src={tenantConfig.logo} />
            </Avatar>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              {tenant?.name}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mb-1 max-w-md">
                {description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {sport && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {sport}
                </Badge>
              )}
              {location?.city && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {location.city}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {/* Quick Links */}
        <nav className="flex gap-4 items-center mt-4 sm:mt-0">
          <Link
            href={`/settings`}
            aria-label="Global Settings"
            className="group"
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              tabIndex={0}
            >
              <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </Button>
          </Link>
          <Link href={`/user/help`} aria-label="Help" className="group">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              tabIndex={0}
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </Button>
          </Link>
          <Link href={`/privacy`} aria-label="Privacy" className="group">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              tabIndex={0}
            >
              <Shield className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </Button>
          </Link>
        </nav>
      </section>

      {/* User Details Section */}
      {tenantUser && (
        <section className="flex items-center gap-4 p-4 rounded-lg border border-border/30 bg-secondary-200/10 max-w-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={undefined} />
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-medium text-foreground">
              {tenantUser.member?.firstName && tenantUser.member?.lastName
                ? `${tenantUser.member.firstName} ${tenantUser.member.lastName}`
                : tenantUser.user?.email || "User"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Role:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {tenantUser.role?.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Type:</span>
                <span className="text-xs px-2 py-0.5 rounded-full   font-medium capitalize">
                  {tenantUser.member?.memberType || "Member"}
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {tenantUser.user?.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Fingerprint className="h-3 w-3" />
                ID: {tenantUser.user?.id}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Available Portals Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-foreground">
          Your Portal{availablePortals.length === 1 ? "" : "s"}
        </h2>
        {availablePortals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availablePortals.map((portal) => {
              const Icon = portal.icon;
              const portalHref = `${portal.type}`;
              const portalConfig = getPortalConfig(portal.type);
              return (
                <Card
                  key={portal.type}
                  className="group relative overflow-hidden border border-border/40 rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 flex flex-col"
                  style={{ borderLeft: `6px solid ${portalConfig.color}` }}
                >
                  <CardHeader className="pb-3 relative">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: portalConfig.color + "22" }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: portalConfig.color }}
                        />
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {portal.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs leading-relaxed">
                      {portal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative mt-auto">
                    <Button
                      asChild
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                      variant="outline"
                    >
                      <Link
                        href={`/${portalHref}`}
                        aria-label={`Open ${portal.title}`}
                      >
                        <div className="flex items-center justify-center gap-2 w-full">
                          <>
                            <span>Open {portal.title}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        </div>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <p className="text-muted-foreground text-sm">
                Your workspace is being set up. Available portals will appear
                here once your permissions are configured.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-border/50 text-center mt-12">
        <p className="text-xs text-muted-foreground">
          {tenant?.name} workspace
        </p>
      </footer>
    </div>
  );
}

"use client";

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
import { useLogOut } from "@/entities/user/User.actions.client";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LogOut, Shield, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAvailablePortals } from "./(domain-landing)/hooks/useAvailablePortals";

interface PlatformPageProps {
  params: {
    domain: string;
  };
}

export default function PlatformPage({ params }: PlatformPageProps) {
  const { tenant, tenantUser, isLoading, error } =
    useTenantAndUserAccessContext();
  const { availablePortals } = useAvailablePortals();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logOutMutation = useLogOut();

  const handleSignOut = async () => {
    try {
      await logOutMutation.mutateAsync();
      queryClient.clear();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-primary/5",
          hoverBg: "group-hover:bg-primary/10",
          icon: "text-primary",
          button: "bg-primary hover:bg-primary/90",
          border: "hover:border-primary/20",
          accent: "bg-primary/10",
        };
      case "green":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          hoverBg:
            "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30",
          icon: "text-emerald-600 dark:text-emerald-400",
          button: "bg-primary hover:bg-primary/90",
          border: "hover:border-emerald-200 dark:hover:border-emerald-800",
          accent: "bg-emerald-100 dark:bg-emerald-950/30",
        };
      case "purple":
        return {
          bg: "bg-violet-50 dark:bg-violet-950/20",
          hoverBg:
            "group-hover:bg-violet-100 dark:group-hover:bg-violet-950/30",
          icon: "text-violet-600 dark:text-violet-400",
          button: "bg-primary hover:bg-primary/90",
          border: "hover:border-violet-200 dark:hover:border-violet-800",
          accent: "bg-violet-100 dark:bg-violet-950/30",
        };
      default:
        return {
          bg: "bg-muted/50",
          hoverBg: "group-hover:bg-muted",
          icon: "text-muted-foreground",
          button: "bg-primary hover:bg-primary/90",
          border: "hover:border-border",
          accent: "bg-muted",
        };
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !tenant) {
    return <ErrorState domain={params.domain} />;
  }

  const tenantConfig = tenant.tenantConfigs;
  const generalConfig = tenantConfig?.general;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Right Side */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <Link href={`/privacy`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-card/80 backdrop-blur-sm hover:bg-card border-border/50"
          >
            <Shield className="w-4 h-4" />
            Privacy
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={logOutMutation.isPending}
          className="flex items-center gap-2 bg-card/80 backdrop-blur-sm hover:bg-card border-border/50"
        >
          <LogOut className="w-4 h-4" />
          {logOutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Centered Header Info */}
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {generalConfig?.logo ? (
              <div className="relative w-16 h-16">
                <Image
                  src={generalConfig.logo}
                  alt={`${tenant.name} logo`}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Tenant Name */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {tenant.name}
          </h1>

          {/* Platform Description */}
          <p className="text-lg text-muted-foreground mb-12">
            Sports Management Platform powered by{" "}
            <span className="font-medium text-primary">SportWise</span>
          </p>

          {/* User Welcome */}
          {tenantUser?.user?.email && (
            <p className="text-sm text-muted-foreground mb-4">
              Welcome back,{" "}
              <span className="font-medium">{tenantUser.user.email}</span>
            </p>
          )}
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto justify-items-center">
          {availablePortals.map((portal) => {
            const colors = getColorClasses(portal.color);
            const IconComponent = portal.icon;

            return (
              <Card
                key={portal.id}
                className={`group hover:shadow-xl transition-all duration-300 border-2 ${colors.border} cursor-pointer w-full max-w-sm bg-card hover:bg-card/95`}
              >
                <CardHeader className="text-center pb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.hoverBg} transition-colors shadow-sm`}
                  >
                    <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2 text-card-foreground">
                    {portal.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-8">
                    {portal.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <div
                          className={`w-1.5 h-1.5 ${colors.icon.replace(
                            "text-",
                            "bg-"
                          )} rounded-full flex-shrink-0`}
                        ></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link href={portal.href}>
                    <Button
                      className={`w-full ${colors.button} text-white font-medium py-3 rounded-xl group-hover:shadow-lg transition-all duration-300`}
                    >
                      <span>Access Portal</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card">
              <CardHeader className="text-center">
                <Skeleton className="w-16 h-16 mx-auto mb-6 rounded-2xl" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-8">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ domain }: { domain: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 mx-auto mb-8 bg-destructive/10 rounded-2xl flex items-center justify-center">
          <Trophy className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Organization Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We couldn&apos;t find an organization with the domain &quot;{domain}
          &quot;. Please check the URL and try again.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

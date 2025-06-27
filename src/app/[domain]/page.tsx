"use client";

import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";
import { useLogOut } from "@/entities/user/User.actions.client";
import { useQueryClient } from "@tanstack/react-query";
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

  return (
    <div className="min-h-screen ">
      {/* Top Navigation - Right Side */}
      {/* <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
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
      </div> */}

      {/* Main Content */}
    </div>
  );
}

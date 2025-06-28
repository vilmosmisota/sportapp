"use client";

import { useTenantAndUserAccessContext } from "@/composites/auth/TenantAndUserAccessContext";

interface PlatformPageProps {
  params: {
    domain: string;
  };
}

export default function PlatformPage({ params }: PlatformPageProps) {
  const { tenant, tenantUser, isLoading, error } =
    useTenantAndUserAccessContext();

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

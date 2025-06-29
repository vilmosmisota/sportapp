import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantByDomain } from "@/entities/tenant/Tenant.services";
import { getServerClient } from "@/libs/supabase/server";
import Image from "next/image";
import LoginForm from "./components/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: { domain: string };
}) {
  const supabase = getServerClient();
  const tenant = await getTenantByDomain(params.domain, supabase);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative sports-themed background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-8 border-primary animate-bounce" />
        <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full border-8 border-primary animate-bounce delay-150" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full border-8 border-primary animate-bounce delay-300" />
      </div>

      <div className="w-full max-w-md relative">
        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            {tenant?.tenantConfigs?.general?.logo && (
              <div className="flex justify-center mb-4">
                <Image
                  src={tenant.tenantConfigs.general.logo}
                  alt={`${tenant.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
              </div>
            )}
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                {tenant?.name || "Welcome"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {tenant?.type === "organization"
                  ? "Organization Portal"
                  : "League Portal"}
              </p>
            </div>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm domain={params.domain} />
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Contact your administrator if you need access to the platform
          </p>
          <p className="text-xs font-semibold text-primary">
            Powered by <span className="font-bold">Sportwise</span>
          </p>
        </div>
      </div>
    </div>
  );
}

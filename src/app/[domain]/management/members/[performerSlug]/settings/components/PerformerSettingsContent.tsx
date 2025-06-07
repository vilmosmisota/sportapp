import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Users } from "lucide-react";

type PerformerSettingsContentProps = {
  tenant?: Tenant;
};

export default function PerformerSettingsContent({
  tenant,
}: PerformerSettingsContentProps) {
  if (!tenant) {
    return null;
  }

  const performersConfig = tenant.tenantConfigs?.performers;

  return (
    <div className="space-y-6">
      {/* Performers Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 bg-muted rounded-lg">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            Display & URL Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">
                Performer Display Name
              </span>
              <span className="text-sm font-semibold text-foreground capitalize">
                {performersConfig?.displayName || "Performers"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground">
                Performer URL Slug
              </span>
              <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                /{performersConfig?.slug || "performers"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

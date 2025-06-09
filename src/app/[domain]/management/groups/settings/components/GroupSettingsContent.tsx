import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tenant } from "@/entities/tenant/Tenant.schema";
import { Palette, Tag } from "lucide-react";

type GroupSettingsContentProps = {
  tenant?: Tenant;
};

// Default settings fallback
const DEFAULT_GROUP_SETTINGS: {
  color: string;
  useCustomName: boolean;
  displayFields: string[];
  displaySeparator: string;
  levelOptions: string[];
} = {
  color: "#FB923C", // Orange-400 (matches schema default)
  useCustomName: false,
  displayFields: ["ageRange"],
  displaySeparator: "•",
  levelOptions: [],
};

export default function GroupSettingsContent({
  tenant,
}: GroupSettingsContentProps) {
  if (!tenant) {
    return null;
  }

  // Use actual tenant config or fallback to defaults
  const groupsConfig = {
    useCustomName:
      tenant.tenantConfigs?.groups?.useCustomName ??
      DEFAULT_GROUP_SETTINGS.useCustomName,
    displayFields:
      tenant.tenantConfigs?.groups?.displayFields ||
      DEFAULT_GROUP_SETTINGS.displayFields,
    displaySeparator:
      tenant.tenantConfigs?.groups?.displaySeparator ||
      DEFAULT_GROUP_SETTINGS.displaySeparator,
    levelOptions:
      tenant.tenantConfigs?.groups?.levelOptions ||
      DEFAULT_GROUP_SETTINGS.levelOptions,
  };

  return (
    <div className="space-y-6">
      {/* Default Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 bg-muted rounded-lg">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">
                Display Mode
              </span>
              <span className="text-sm text-foreground">
                {groupsConfig.useCustomName ? "Custom Names" : "Derived Fields"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">
                {groupsConfig.useCustomName
                  ? "Fallback Display Fields"
                  : "Default Display Fields"}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {groupsConfig.displayFields.map(
                    (field: string, index: number) => (
                      <div key={field} className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {field.replace(/([A-Z])/g, " $1")}
                        </Badge>
                        {index < groupsConfig.displayFields.length - 1 && (
                          <span className="text-xs text-muted-foreground">
                            {groupsConfig.displaySeparator}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground">
                Display Separator
              </span>
              <span className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                {groupsConfig.displaySeparator}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 bg-muted rounded-lg">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            Value Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Level Options */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Level Options
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Available skill levels
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {groupsConfig.levelOptions.length > 0 ? (
                    groupsConfig.levelOptions.map((option) => (
                      <Badge key={option} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No options configured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

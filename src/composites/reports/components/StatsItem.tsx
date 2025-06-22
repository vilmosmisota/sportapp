import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function StatItem({
  icon: Icon,
  label,
  value,
  className,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  className?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div
                  className={`flex items-center text-xs ${
                    trend === "up"
                      ? "text-green-600"
                      : trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

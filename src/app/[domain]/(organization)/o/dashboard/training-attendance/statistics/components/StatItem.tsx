import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatItemProps } from "../types";

export function StatItem({
  icon: Icon,
  label,
  value,
  className,
}: StatItemProps) {
  return (
    <Card className={cn("hover:bg-accent/50 transition-colors", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

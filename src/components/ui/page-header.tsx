import { ReactNode } from "react";
import { Button } from "./button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backButton?: {
    href: string;
    label?: string;
  };
}

export function PageHeader({
  title,
  description,
  actions,
  backButton,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-border">
      <div className="space-y-1">
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-4 h-8 text-muted-foreground"
            asChild
          >
            <Link href={backButton.href}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backButton.label || "Back"}
            </Link>
          </Button>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

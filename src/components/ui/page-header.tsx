import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./button";

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6">
      <div className="space-y-1">
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 sm:mb-2 -ml-3 sm:-ml-4 h-7 sm:h-8 text-muted-foreground"
            asChild
          >
            <Link href={backButton.href}>
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {backButton.label || "Back"}
              </span>
            </Link>
          </Button>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight line-clamp-2 capitalize">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center flex-wrap justify-start sm:justify-end gap-2 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

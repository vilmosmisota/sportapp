import { cn } from "@/libs/tailwind/utils";
import Link from "next/link";

export function MainMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="max-w-screen-2xl flex h-9 items-center space-x-1 rounded-md border bg-background p-1 px-5 shadow-sm">
      <div className=" text-center mr-5">Logo </div>
      <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        <Link
          href="/examples/dashboard"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Schedules
        </Link>
        <Link
          href="/examples/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Standing
        </Link>
        <Link
          href="/examples/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Teams
        </Link>
        <Link
          href="/examples/dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Players
        </Link>
      </nav>
    </div>
  );
}

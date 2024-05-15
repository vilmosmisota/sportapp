import { Building, ContactRound, Medal, Shield, Store } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex-1">
            <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4 mt-6">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg  text-muted-foreground transition-all hover:text-primary"
              >
                <Building className="h-4 w-4" />
                League
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg  text-muted-foreground transition-all hover:text-primary"
              >
                <Store className="h-4 w-4" />
                Organizations
              </Link>
              <Link
                href="/dashboard/divisions"
                className="flex items-center gap-3 rounded-lg  text-muted-foreground transition-all hover:text-primary"
              >
                <Medal className="h-4 w-4" />
                Divisions
              </Link>
              <Link
                href="/dashboard/divisions"
                className="flex items-center gap-3 rounded-lg  text-muted-foreground transition-all hover:text-primary"
              >
                <Shield className="h-4 w-4" />
                Games
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg   text-primary transition-all hover:text-primary"
              >
                <ContactRound className="h-4 w-4" />
                Players
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

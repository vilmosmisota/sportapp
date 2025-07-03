import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlatformPageSkeleton() {
  return (
    <div className="w-full space-y-8 max-w-6xl mx-auto px-2 sm:px-6">
      {/* Tenant Details Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-b border-border/30">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-4 w-96 mb-1" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
        <nav className="flex gap-4 items-center mt-4 sm:mt-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-full" />
          ))}
        </nav>
      </section>

      {/* User Details Section */}
      <section className="flex items-center gap-4 p-4 rounded-lg border border-border/30 bg-muted/30 max-w-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-4 w-36 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </section>

      {/* Available Portals Section */}
      <section>
        <Skeleton className="h-7 w-32 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden border border-border/40 rounded-lg shadow-sm"
              style={{ borderLeft: "6px solid #e2e8f0" }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-border/50 text-center mt-12">
        <Skeleton className="h-4 w-48 mx-auto" />
      </footer>
    </div>
  );
}

export default function Loading() {
  return <PlatformPageSkeleton />;
}

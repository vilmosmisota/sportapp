import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          </div>
          <Skeleton className="h-8 w-64 mx-auto mb-4" />

          {/* User greeting skeleton */}
          <div className="mb-4">
            <Skeleton className="h-6 w-80 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>

          <Skeleton className="h-6 w-96 mx-auto mb-4" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* Portal Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-6 w-24" />
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

        {/* Footer Skeleton */}
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

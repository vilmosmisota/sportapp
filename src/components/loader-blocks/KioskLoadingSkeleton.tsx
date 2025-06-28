import { Skeleton } from "@/components/ui/skeleton";

export function KioskLoadingSkeleton() {
  return (
    <div className="w-screen h-screen bg-background fixed top-0 left-0 flex flex-col z-50 overflow-hidden">
      {/* Navigation Skeleton */}
      <div className="flex justify-between items-center border-b border-border px-4 h-12 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />

        {/* Mode Buttons Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden p-3">
        <div className="max-w-6xl mx-auto h-full">
          {/* Header Section */}
          <div className="text-center mb-4">
            <Skeleton className="h-7 w-32 mx-auto mb-2" />
            <div className="flex items-center justify-center gap-4 mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>

          {/* Centered Keypad Area - Full Height */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="flex flex-col items-center">
              {/* PIN Display Skeleton */}
              <div className="mb-8">
                <div className="flex justify-center gap-4 mb-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Skeleton key={index} className="w-6 h-6 rounded-full" />
                  ))}
                </div>
                <div className="flex justify-center h-6">
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-center mt-1 h-6">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Keypad Skeleton - Larger and more prominent */}
              <div className="w-[400px] p-8 border border-border rounded-2xl bg-card">
                {/* Number Grid */}
                <div className="grid grid-cols-3 place-items-center gap-6 mb-6">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <Skeleton key={index} className="w-20 h-20 rounded-full" />
                  ))}
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-3 place-items-center gap-6 mb-6">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="w-20 h-20" /> {/* Spacer */}
                </div>

                {/* Submit Button */}
                <Skeleton className="w-full h-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

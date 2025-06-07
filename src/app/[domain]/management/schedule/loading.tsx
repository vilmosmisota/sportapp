import {
  PageHeaderSkeleton,
  FilterCardSkeleton,
  CalendarSkeleton,
} from "@/components/loader-blocks";

export default function ScheduleLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header section */}
      <PageHeaderSkeleton
        titleWidth="w-48"
        descriptionWidth="w-96"
        actionButtonsWidth={["w-[180px]", "w-[120px]"]}
      />

      {/* Filter card */}
      <FilterCardSkeleton />

      {/* Calendar */}
      <CalendarSkeleton showRandomEvents={true} />
    </div>
  );
}

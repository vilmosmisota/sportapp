import { format } from "date-fns";
import { Training } from "@/entities/training/Training.schema";
import { MapPin, Dumbbell, CheckCircle2 } from "lucide-react";
import { formatEventTime } from "./utils";
import {
  EventItemProps,
  MinimalEventWrapper,
  CompactEventWrapper,
  FullEventWrapper,
  getTrainingIcon,
  getEventIcon,
  getLocation,
} from "./event-item-utils";

interface TrainingEventItemProps extends EventItemProps {
  teamColor?: string;
  useCustomStyling: boolean;
  getCustomStyles: () => React.CSSProperties;
}

export function TrainingEventItem({
  event,
  onClick,
  variant = "compact",
  className,
  teamColor,
  useCustomStyling,
  getCustomStyles,
}: TrainingEventItemProps) {
  const training = event.data as Training;
  const isAggregated = training.isAggregated || false;

  // Minimal variant (for month view cells with limited space)
  if (variant === "minimal") {
    return (
      <MinimalEventWrapper
        event={event}
        onClick={onClick}
        useCustomStyling={useCustomStyling}
        className={className}
        getCustomStyles={getCustomStyles}
      >
        {/* Time */}
        <span className="font-semibold whitespace-nowrap">
          {format(event.start, "HH:mm")}
        </span>

        {/* Icon */}
        {getTrainingIcon("small")}

        {/* Content - all on one line */}
        <span className="truncate">{event.title}</span>

        {/* Aggregated indicator */}
        {isAggregated && (
          <CheckCircle2
            className="w-3 h-3 text-green-600 ml-1 flex-shrink-0"
            strokeWidth={2.5}
          />
        )}
      </MinimalEventWrapper>
    );
  }

  // Compact variant (for month view when space allows)
  if (variant === "compact") {
    return (
      <CompactEventWrapper
        event={event}
        onClick={onClick}
        useCustomStyling={useCustomStyling}
        className={className}
        getCustomStyles={getCustomStyles}
      >
        <div className="flex items-center gap-2 w-full">
          {/* Time */}
          <span className="font-semibold whitespace-nowrap">
            {format(event.start, "HH:mm")}
          </span>

          {/* Icon */}
          <Dumbbell
            className="w-3.5 h-3.5 text-blue-600 flex-shrink-0"
            strokeWidth={3}
          />

          {/* Content */}
          <span className="truncate">{event.title}</span>

          {/* Aggregated indicator */}
          {isAggregated && (
            <div className="flex items-center ml-auto">
              <CheckCircle2
                className="w-3.5 h-3.5 text-green-600 flex-shrink-0"
                strokeWidth={2.5}
              />
            </div>
          )}
        </div>
      </CompactEventWrapper>
    );
  }

  // Full variant (for week and agenda views)
  return (
    <FullEventWrapper
      event={event}
      onClick={onClick}
      useCustomStyling={useCustomStyling}
      className={className}
      getCustomStyles={getCustomStyles}
    >
      {/* Header section with event type and time */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {getTrainingIcon("large")}
          <span className="font-medium text-xs">
            {formatEventTime(event.start, event.end, event.type)}
          </span>
        </div>

        {/* Aggregated indicator */}
        {isAggregated && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
            <span className="text-xs font-medium">Aggregated</span>
          </div>
        )}
      </div>

      {/* Training title */}
      <div className="font-semibold mb-3">{event.title}</div>

      {/* Footer with location */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="w-3.5 h-3.5" />
        <span className="text-xs">{getLocation(event)}</span>
      </div>
    </FullEventWrapper>
  );
}

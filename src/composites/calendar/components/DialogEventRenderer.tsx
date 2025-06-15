"use client";

import { useEventDialog } from "../providers/EventDialogProvider";
import { CalendarEvent } from "../types/calendar.types";
import { EventRenderer } from "./EventRenderer";

interface DialogEventRendererProps<TEvent extends CalendarEvent> {
  event: TEvent;
  variant?: "minimal" | "compact" | "full";
  className?: string;
  onDoubleClick?: (event: TEvent) => void;
}

export function DialogEventRenderer<TEvent extends CalendarEvent>({
  event,
  variant = "compact",
  className,
  onDoubleClick,
}: DialogEventRendererProps<TEvent>) {
  const { openEventDialog } = useEventDialog();

  const handleClick = (event: TEvent) => {
    openEventDialog(event);
  };

  return (
    <EventRenderer
      event={event}
      variant={variant}
      className={className}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    />
  );
}

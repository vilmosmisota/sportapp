import { useState } from "react";
import { CalendarEvent } from "../types/calendar.types";

interface UseEventDetailsDialogReturn {
  event: CalendarEvent | null;
  isOpen: boolean;
  openDialog: (event: CalendarEvent) => void;
  closeDialog: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useEventDetailsDialog(): UseEventDetailsDialogReturn {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = (event: CalendarEvent) => {
    setEvent(event);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Clear event data after dialog closes with a small delay
      setTimeout(() => {
        setEvent(null);
      }, 200);
    }
  };

  return {
    event,
    isOpen,
    openDialog,
    closeDialog,
    onOpenChange,
  };
}

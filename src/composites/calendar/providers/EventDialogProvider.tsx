"use client";

import { createContext, ReactNode, useContext } from "react";
import { EventDetailsDialog } from "../components/EventDetailsDialog";
import { useEventDetailsDialog } from "../hooks/useEventDetailsDialog";
import { CalendarEvent } from "../types/calendar.types";

interface EventDialogContextType {
  openEventDialog: (event: CalendarEvent) => void;
  closeEventDialog: () => void;
}

const EventDialogContext = createContext<EventDialogContextType | undefined>(
  undefined
);

interface EventDialogProviderProps {
  children: ReactNode;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
}

export function EventDialogProvider({
  children,
  onEditEvent,
  onDeleteEvent,
}: EventDialogProviderProps) {
  const { event, isOpen, openDialog, closeDialog, onOpenChange } =
    useEventDetailsDialog();

  const contextValue: EventDialogContextType = {
    openEventDialog: openDialog,
    closeEventDialog: closeDialog,
  };

  return (
    <EventDialogContext.Provider value={contextValue}>
      {children}
      <EventDetailsDialog
        event={event}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onEdit={onEditEvent}
        onDelete={onDeleteEvent}
      />
    </EventDialogContext.Provider>
  );
}

export function useEventDialog() {
  const context = useContext(EventDialogContext);

  if (!context) {
    throw new Error(
      "useEventDialog must be used within an EventDialogProvider"
    );
  }

  return context;
}

"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CalendarPlus, Eye } from "lucide-react";
import React, { useRef } from "react";

interface CalendarContextMenuProps {
  children: React.ReactNode;
  date: Date;
  onAddSession: (date: Date) => void;
  onViewDetails?: (date: Date) => void;
}

export function CalendarContextMenu({
  children,
  date,
  onAddSession,
  onViewDetails,
}: CalendarContextMenuProps) {
  const contextMenuTriggerRef = useRef<HTMLDivElement | null>(null);

  const openContextMenu = () => {
    if (contextMenuTriggerRef.current) {
      const element = contextMenuTriggerRef.current;
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Create and dispatch a context menu event
      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: centerX,
        clientY: centerY,
      });

      element.dispatchEvent(contextMenuEvent);
    }
  };

  const originalRef = (children as any).ref;

  const combinedRef = (element: HTMLDivElement | null) => {
    contextMenuTriggerRef.current = element;

    if (typeof originalRef === "function") {
      originalRef(element);
    }

    if (element) {
      (element as any).__openContextMenu = openContextMenu;
    }
  };

  const childrenWithProps = React.cloneElement(children as React.ReactElement, {
    ref: combinedRef,
  });

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>{childrenWithProps}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem
          onClick={() => onAddSession(date)}
          className="cursor-pointer"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add Session
        </ContextMenuItem>

        {onViewDetails && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onViewDetails(date)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

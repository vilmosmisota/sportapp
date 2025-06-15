/**
 * Core calendar types for the reusable calendar system
 */

export type CalendarView = "month" | "week" | "day";

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Season break period
 */
export interface SeasonBreak {
  from: Date;
  to: Date;
}

/**
 * Season information for calendar display
 */
export interface CalendarSeason {
  id: number;
  startDate: Date;
  endDate: Date;
  breaks: SeasonBreak[];
  customName?: string;
}

import { TenantGroupsConfig } from "@/entities/tenant/Tenant.schema";

/**
 * Generic calendar event interface that can wrap any data type
 */
export interface CalendarEvent<TData = any> {
  id: string | number;
  type: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  data: TData; // Original source data
  metadata?: CalendarEventMetadata;
  tenantGroupsConfig?: TenantGroupsConfig;
}

export interface CalendarEventMetadata {
  color?: string;
  category?: string;
  priority?: number;
  description?: string;
}

/**
 * Calendar configuration for different use cases
 */
export interface CalendarConfig<TEvent extends CalendarEvent> {
  defaultView: CalendarView;
  features: CalendarFeatures;
  styling: CalendarStyling;
}

export interface CalendarFeatures {
  navigation: boolean;
  eventCreation: boolean;
  eventEditing: boolean;
  multiSelect: boolean;
  viewSwitching: boolean;
}

export interface CalendarStyling {
  theme: "light" | "dark" | "auto";
  colorScheme?: string;
  compact: boolean;
}

/**
 * Calendar navigation state
 */
export interface CalendarNavigation {
  currentDate: Date;
  view: CalendarView;
  dateRange: DateRange;
}

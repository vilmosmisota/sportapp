export type CalendarViewType = "day" | "month";

export interface CalendarView {
  name: CalendarViewType;
  label: string;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isInBreak?: boolean;
  isOutsideSeason?: boolean;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export interface CalendarHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  filteredCount?: number;
  totalCount?: number;
}

export type EventColors = {
  bg: string;
  text: string;
  border: string;
};

// Calendar event data types
export interface TeamGroup {
  age?: string;
  gender?: string;
  skill?: string;
}

export interface TeamAppearance {
  color?: string;
}

export interface Team {
  name?: string;
  color?: string;
  details?: string;
  group?: TeamGroup;
  appearance?: TeamAppearance;
  age?: string;
  gender?: string;
  skill?: string;
}

export interface Competition {
  name: string;
  color?: string;
}

export interface Location {
  name: string;
  city?: string;
  postcode?: string;
  streetAddress?: string;
  mapLink?: string;
  id?: string;
}

export interface GameDisplayDetails {
  homeTeam: Team;
  awayTeam: Team;
  competition?: Competition;
}

export interface GameData {
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore?: number;
  awayScore?: number;
  location?: Location;
  notes?: string; // Kept for backward compatibility
  displayDetails?: GameDisplayDetails;
  meta?: {
    note?: string;
  };
  status?: string;
  season?: any; // Added for EventDetailsDialog
}

export interface TrainingData {
  team?: Team;
  location?: Location;
  notes?: string; // Kept for backward compatibility
  meta?: {
    note?: string;
  };
  season?: any; // Added for EventDetailsDialog
  teamName?: string; // Added for EventDetailsDialog
}

// Type guards for events
export function isGameEvent(event: { type: string }): boolean {
  return event.type === "game";
}

export function isTrainingEvent(event: { type: string }): boolean {
  return event.type === "training";
}

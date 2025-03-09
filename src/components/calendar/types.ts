export type CalendarViewType = "day" | "week" | "month";

export interface CalendarView {
  name: CalendarViewType;
  label: string;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
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

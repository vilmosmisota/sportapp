import { LucideIcon } from "lucide-react";
import { ButtonProps } from "@/components/ui/button";
import { GameStatus } from "@/entities/game/Game.schema";
import { ReactNode } from "react";

export type FilterSectionType =
  | "toggle"
  | "multi-select"
  | "range"
  | "search"
  | "date-range";

export interface FilterSection {
  id: string;
  title: string;
  type: FilterSectionType;
  icon: LucideIcon;
  liveUpdate?: boolean;
  clearable?: boolean;
}

export interface FilterControls {
  trigger: ReactNode;
  panel: {
    sections: FilterSection[];
    actions: {
      apply: ButtonProps;
      reset: ButtonProps;
      presetMenu?: {
        items: Array<{ id: string; label: string }>;
        onSelect: (id: string) => void;
      };
    };
  };
  mobile?: {
    fullScreenOnMobile?: boolean;
    position?: "bottom" | "right";
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: CalendarFilters;
  isDefault?: boolean;
  createdAt: Date;
}

export interface EventTypeFilters {
  games: boolean;
  trainings: boolean;
}

export interface StatusFilters {
  gameStatuses: Record<GameStatus, boolean>;
  trainingAvailability?: {
    available: boolean;
    full: boolean;
    cancelled: boolean;
  };
}

export interface TeamFilters {
  selectedTeams: (number | string)[]; // Team IDs can be number or string
}

export interface SeasonFilters {
  selectedSeason: number | null; // Season ID
}

export interface LocationFilters {
  selectedLocations: (number | string)[]; // Location IDs can be number or string
}

export interface DateRangeFilters {
  preset: "today" | "this-week" | "this-month" | "upcoming" | "past" | "custom";
  startDate: Date | null;
  endDate: Date | null;
}

export interface CalendarFilters {
  eventTypes: EventTypeFilters;
  statuses: StatusFilters;
  teams: TeamFilters;
  seasons: SeasonFilters;
  locations: LocationFilters;
  dateRange: DateRangeFilters;
}

export interface FilterContextType {
  filters: CalendarFilters;
  activeFilterCount: number;
  presets: FilterPreset[];
  selectedPresetId: string | null;
  updateFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
  savePreset: (name: string) => void;
  applyPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
}

export const defaultFilters: CalendarFilters = {
  eventTypes: {
    games: true,
    trainings: true,
  },
  statuses: {
    gameStatuses: {
      scheduled: true,
      in_progress: true,
      completed: true,
      canceled: false,
      postponed: true,
      forfeit: false,
      abandoned: false,
      draft: false,
    },
    trainingAvailability: {
      available: true,
      full: true,
      cancelled: false,
    },
  },
  teams: {
    selectedTeams: [],
  },
  seasons: {
    selectedSeason: null,
  },
  locations: {
    selectedLocations: [],
  },
  dateRange: {
    preset: "upcoming",
    startDate: null,
    endDate: null,
  },
};

import { Group } from "@/entities/group/Group.schema";
import { Season } from "@/entities/season/Season.schema";
import { Location } from "@/entities/shared/Location.schema";
import { Tenant } from "@/entities/tenant/Tenant.schema";

export interface RecurrenceConfig {
  type: "once" | "repeat";
}

export interface SessionFormData {
  groupId: string;
  startTime: string;
  endTime: string;
  locationId: string;
  date: Date;
  recurrence: RecurrenceConfig;
  note?: string;
}

export interface SessionFormProps {
  // Required context
  tenant: Tenant;
  season: Season;
  locations: Location[];

  // Mode-specific props
  groupId?: number; // For single group (group events page)
  groups?: Group[]; // For multi-group (calendar page)
  initialDate?: Date;

  // Callbacks
  onSuccess: () => void;
  onCancel: () => void;

  // Optional configuration
  className?: string;
}

export interface RecurrenceSelectorProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  season: Season;
  className?: string;
}

export interface SessionPreviewProps {
  formData: SessionFormData;
  season: Season;
  locations: Location[];
  groups?: Group[];
  className?: string;
}

export const DEFAULT_RECURRENCE: RecurrenceConfig = {
  type: "once",
};
